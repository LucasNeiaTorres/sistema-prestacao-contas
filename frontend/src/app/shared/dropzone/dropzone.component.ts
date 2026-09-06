import { Component, Input, ViewChild } from '@angular/core';
import { DropzoneControl } from './dropzone-control.class';
import { AnimacoesService } from '../animacoes/animacoes.service';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
})
export class DropzoneComponent {
  @Input() control: DropzoneControl;
  @ViewChild('dropzone') dropzoneElement: any;
  @ViewChild('previewTemplate') previewTemplate: any;
  @ViewChild('previewsContainer') previewsContainer: any;
  @ViewChild('spinner') spinner: any;

  constructor(private animacoesService: AnimacoesService) {}

  ngAfterViewInit() {
    this.control.init(this.dropzoneElement.nativeElement, {
      previewsContainer: this.previewsContainer.nativeElement,
      previewTemplate: this.previewTemplate.nativeElement.innerHTML,
      removedfile: (file) => {
        this.control.dropzone._updateMaxFilesReachedClass();
        this.animacoesService
          .minimizeElement(file.previewElement)
          .subscribe(() => {
            // Copiado do Dropzone.js
            if (
              file.previewElement != null &&
              file.previewElement.parentNode != null
            ) {
              file.previewElement.parentNode.removeChild(file.previewElement);
            }
          });
      },
    });

    this.control.processing().subscribe((file) => {
      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-processing]'
      )) {
        node.classList.remove('d-none');
      }

      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-remove]'
      )) {
        node.classList.add('d-none');
      }
    });

    this.control.error().subscribe(([file, response]) => {
      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-processing]'
      )) {
        node.classList.add('d-none');
      }

      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-error]'
      )) {
        node.classList.remove('d-none');
      }

      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-remove]'
      )) {
        node.classList.remove('d-none');
      }

      if (response.detail) {
        file.previewElement.querySelector(
          '[data-dz-errormessage]'
        ).textContent = response.detail;
      }

      if (!response) {
        file.previewElement.querySelector(
          '[data-dz-errormessage]'
        ).textContent = 'Erro ao enviar arquivo. Tente novamente.';
      }
    });

    this.control.success().subscribe(([file, _]) => {
      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-processing]'
      )) {
        node.classList.add('d-none');
      }

      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-success]'
      )) {
        node.classList.remove('d-none');
      }

      for (let node of file.previewElement.querySelectorAll(
        '[data-dz-remove]'
      )) {
        node.classList.remove('d-none');
      }
    });
  }

  ngOnDestroy() {
    this.control.destroy();
  }
}
