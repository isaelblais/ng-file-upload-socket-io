import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadComponent } from './components/file-upload.component';
import { MaterialModule } from '../material-module/material.module';

@NgModule({
  imports: [CommonModule, HttpClientModule, MaterialModule],
  declarations: [FileUploadComponent],
  exports: [FileUploadComponent]
})
export class FileUploadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FileUploadModule,
      providers: []
    }
  }
}