import { Observable } from 'rxjs';
import SocketIOFileClient from 'socket.io-file-client';

export class FileUploadHolderModel {
    data: File;
    state: string;
    inProgress: boolean;
    canRetry: boolean;
    canCancel: boolean;
    socket: {
      client: SocketIOFileClient;
      status: Observable<number>;
    }
  }