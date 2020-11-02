import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import * as io from "socket.io-client";
import SocketIOFileClient from 'socket.io-file-client';
import { Observable, of, Subscription } from 'rxjs';
import { animate, query, state, style, transition, trigger } from '@angular/animations';
import { FileUploadHolderModel } from '../models/file-upload-holder.model';

const fade = [
  query(':self',
    [
      style({ opacity: 0 })
    ],
    { optional: true }
  ),

  query(':self',
    [
      style({ opacity: 0 }),
      animate('.3s', style({ opacity: 1 }))
    ],
    { optional: true }
  )
];

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition('* => *', fade)
    ])
  ]
  //encapsulation: ViewEncapsulation.ShadowDom
})
export class FileUploadComponent implements OnInit {

  @Input() text = 'Upload';
  @Input() param = 'file';
  @Input() target = 'http://localhost:8080';
  @Input() accept = 'image/*';
  @Output() complete = new EventEmitter<string>();

  files: Array<FileUploadHolderModel> = [];

  socket = io('http://localhost:8080');
  // Main input reference
  @ViewChild('fileUploadInput', { static: false })
  private fileUploadInputElem: ElementRef;

  ngOnInit() {

  }

  prepareSocketObservable(): any { //Observable<number> {
    console.log("Return observable")
    let client = new SocketIOFileClient(this.socket);
    return {
      client,
      status: Observable.create(observer => {
        client.on('start', function (fileInfo) {
          console.log("File info: ", fileInfo)
          console.log('Start uploading', fileInfo);
          observer.next(0);
        }.bind(this));
        client.on('stream', function (fileInfo) {
          console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
          observer.next(Math.round(fileInfo.sent / (fileInfo.size || fileInfo.sent) * 100))
        }.bind(this));
        client.on('complete', function (fileInfo) {
          console.log('Upload Complete', fileInfo);
          observer.next(100);
        }.bind(this));
        client.on('error', function (err) {
          console.log('Error!', err);
          observer.error(err);
        }.bind(this));
        client.on('abort', function (fileInfo) {
          console.log('Aborted: ', fileInfo);
          observer.error('ABORT');
        }.bind(this));
      })
    }
  }

  onClick() {
    this.fileUploadInputElem.nativeElement.onchange = () => {
      for (let index = 0; index < this.fileUploadInputElem.nativeElement.files.length; index++) {
        const file = this.fileUploadInputElem.nativeElement.files[index];
        this.files.push({
          data: file, state: 'in',
          inProgress: false, canRetry: false, canCancel: true,
          socket: this.prepareSocketObservable()
        });
      }
    }
    this.fileUploadInputElem.nativeElement.click();
  }

  cancelFile(file: FileUploadHolderModel) {
    //file.sub.obs.unsubscribe();
    this.removeFileFromArray(file);
  }

  retryFile(file: FileUploadHolderModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  uploadFile(file: FileUploadHolderModel) {
    console.log("uploadFile: ", file);

    file.inProgress = true;

    file.socket.client.upload({
      files: [
        file.data
      ]
    }, {
      data: { prop: "test data" }
    });
    file.socket.status.subscribe(
      () => {
        console.log("Result of file observable !")
      },
      err => console.error(err)
    );
  }

  uploadFiles() {

    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  private removeFileFromArray(file: FileUploadHolderModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

}