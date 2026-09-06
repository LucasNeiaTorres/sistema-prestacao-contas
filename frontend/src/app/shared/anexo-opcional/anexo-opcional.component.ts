import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DropzoneComponent } from '../dropzone/dropzone.component';
import { DropzoneControl } from '../dropzone/dropzone-control.class';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-anexo-opcional',
  templateUrl: './anexo-opcional.component.html',
  styleUrls: ['./anexo-opcional.component.scss'],
})
export class AnexoOpcionalComponent {
  @Input() dropzoneControl: DropzoneControl;

  @Input() justificativa: string;
  @Output() justificativaChange = new EventEmitter<string>();

  @Input() hasAnexo = true;
  @Output() hasAnexoChange = new EventEmitter<boolean>();

  justificativaControl = new FormControl('');
  hasAnexoControl = new FormControl(true);
  justificativaWordCount = 0;

  ngOnInit() {
    this.justificativaControl.setValue(this.justificativa);
    this.hasAnexoControl.setValue(!this.hasAnexo);

    this.justificativaControl.valueChanges.subscribe((value) => {
      this.justificativaWordCount = value.length;
      this.justificativaChange.emit(value);
    });

    this.hasAnexoControl.valueChanges.subscribe((value) => {
      this.hasAnexoChange.emit(!value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['justificativa']) {
      this.justificativaControl.setValue(changes['justificativa'].currentValue);
    }

    if (changes['hasAnexo']) {
      this.hasAnexoControl.setValue(!changes['hasAnexo'].currentValue);
    }
  }
}
