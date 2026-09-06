import {
  Observable,
  buffer,
  bufferCount,
  concat,
  concatMap,
  filter,
  first,
  fromEvent,
  iif,
  map,
  merge,
  mergeMap,
  of,
  range,
  take,
  tap,
  toArray,
} from 'rxjs';
import { DropzoneOptionsInterface } from './dropzone-options.interface';
import Dropzone from 'dropzone';

export class DropzoneControl {
  dropzone: any;

  constructor(private dropzoneOptions: DropzoneOptionsInterface) {}

  get options() {
    return this.dropzone.options;
  }

  set options(options: DropzoneOptionsInterface) {
    this.dropzone.options = options;
  }

  init(element: HTMLElement, overrideOptions?: DropzoneOptionsInterface) {
    Dropzone.autoDiscover = false;
    this.dropzone = new Dropzone(element, {
      ...this.dropzoneOptions,
      ...overrideOptions,
    });
  }

  addedFile(): Observable<any> {
    return this.getEventObservable('addedfile');
  }

  removedFile(): Observable<any> {
    return this.getEventObservable('removedfile');
  }

  success(): Observable<any> {
    return this.getEventObservable('success');
  }

  error(): Observable<[any, any]> {
    return this.getEventObservable('error');
  }

  complete(): Observable<any> {
    return this.getEventObservable('complete');
  }

  processing(): Observable<any> {
    return this.getEventObservable('processing');
  }

  successAll(): Observable<any> {
    return this.success().pipe(
      filter(() => this.dropzone.getQueuedFiles().length === 0),
      map(() => this.dropzone.getAcceptedFiles()),
      first()
    );
  }

  removedAll(): Observable<any> {
    if (this.dropzone.getQueuedFiles().length === 0) {
      return of(null);
    }
    return this.removedFile().pipe(
      filter(() => this.dropzone.getQueuedFiles().length === 0),
      map(() => null)
    );
  }

  processQueue() {
    const iterationsNeeded = Math.ceil(
      this.dropzone.getQueuedFiles().length / this.options.parallelUploads
    );
    return range(1, iterationsNeeded).pipe(
      concatMap(() => {
        this.dropzone.processQueue();
        return this.complete().pipe(take(this.options.parallelUploads));
      }),
      toArray()
    );
  }

  disable() {
    this.dropzone.disable();
  }

  reset() {
    this.dropzone.removeAllFiles();
  }

  destroy() {
    this.dropzone.destroy();
  }

  getEventObservable(eventName: string): Observable<any> {
    return fromEvent(this.dropzone, eventName);
  }

  getInvalidFiles() {
    return this.dropzone
      .getRejectedFiles()
      .concat(this.dropzone.getFilesWithStatus(Dropzone.ERROR));
  }

  getQueuedFiles() {
    return this.dropzone.getQueuedFiles();
  }

  getSucceededFiles() {
    return this.dropzone.getFilesWithStatus(Dropzone.SUCCESS);
  }

  addFakeFile(file: { name: string; size?: number; type: string }) {
    const blob = new Blob(['.'.repeat(file.size ?? 0)], { type: file.type });
    const newFile: any = new File([blob], file.name, { type: file.type });
    this.dropzone.addFile(newFile);
    return newFile;
  }

  simulateSuccess(file: any, response: any) {
    file.accepted = true;
    file.status = Dropzone.SUCCESS;
    this.dropzone.emit('success', [file, response]);
  }
}
