import { ChangeDetectorRef, Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { validarCpf } from 'src/app/shared/validators.service';
import { FormService, FormName } from 'src/app/tutorial/form.service';

@Component({
  selector: 'app-cadastro-residentes',
  templateUrl: './cadastro-residentes.component.html',
  styleUrls: ['./cadastro-residentes.component.scss'],
})
export class CadastroResidentesComponent {
  isCollapsed: boolean[] = [];
  isRemoving: boolean[] = [];
  addThis = false;
  form: FormArray;
  formName: FormName = 'residentes';
  validators = {
    nome: [Validators.required],
    parentesco: [Validators.required],
    cpf: [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(14),
      validarCpf,
    ],
  };

  constructor(
    private formService: FormService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (
      this.formService.getFormResidentes() &&
      (this.formService.getFormResidentes() as FormArray).length > 0
    ) {
      this.form = this.formService.getFormResidentes();

      // se o form não tiver validadores (provavelmente foi preenchido pelo localStorage)
      if (!this.form.controls[0].get('nome').validator) {
        this.setaValidadores();
        this.formService.setFormResidentes(this.form);
      }
    } else {
      this.form = new FormArray([]);

      this.obtemResidentesStorage();

      this.formService.setFormResidentes(this.form);
    }
    // seta os colapsaveis como fechados por padrão
    this.isCollapsed = this.form.controls.map(() => true);

    // se ouver mudança no form do serviço, atualiza o form - usado para editMode
    this.formService.formResidentes.subscribe((form) => {
      if (form) this.form = form;
      this.setaValidadores();
    });
  }

  ngAfterViewInit() {
    if (!this.form.controls[0]?.get('nome').validator) this.setaValidadores();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  setaValidadores() {
    Object.keys(this.form.controls).forEach((residente) => {
      Object.keys(this.form.controls[residente].controls).forEach((campo) => {
        this.form.controls[residente]
          .get(campo)
          .setValidators(this.validators[campo]);
        this.form.controls[residente].get(campo).markAsTouched();
        this.form.controls[residente].get(campo).updateValueAndValidity();
      });
    });
  }

  obtemResidentesStorage() {
    let residenteStorage;
    while (
      (residenteStorage = localStorage.getItem(
        `form-residente-${this.form.length}`
      ))
    ) {
      const residente = new FormGroup({});
      Object.keys(this.validators).forEach((campo) => {
        residente.addControl(
          campo,
          new FormControl(residenteStorage, this.validators[campo])
        );
      });
      this.form.push(residente);
    }
  }

  adicionaResidente() {
    const residente = new FormGroup({});

    Object.keys(this.validators).forEach((campo) => {
      residente.addControl(
        campo,
        new FormControl(null, this.validators[campo])
      );
    });
    this.form.push(residente);
    this.isCollapsed.push(true);
    this.addThis = true;
    // timeouts para animação de adição de residente
    setTimeout(() => {
      this.addThis = false;
      this.isCollapsed[this.isCollapsed.length - 1] = false;

      // scroll para o último residente adicionado
      setTimeout(() => {
        const element = document.getElementById(
          (this.form.length - 1).toString()
        );
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        localStorage.setItem(
          `form-residente-${this.form.length - 1}`,
          JSON.stringify(this.form.at(this.form.length - 1).value)
        );
      }, 270);
    }, 100);
  }

  removeResidente(index: number) {
    this.isRemoving[index] = true;
    setTimeout(() => {
      this.isCollapsed[index] = true; // Fecha o residente para ocultar o conteúdo antes de remover
      setTimeout(() => {
        (<FormArray>this.form).removeAt(index);
        this.isCollapsed.splice(index, 1);
        this.isRemoving.splice(index, 1);
        localStorage.removeItem(`form-residente-${index}`);
        this.reorganizaStorage();
      }, 300);
    }, 100);
  }

  // função para reorganizar os itens do localStorage após a remoção de um residente 
  reorganizaStorage() {
    const formArray = this.form as FormArray;
    for (let i = 0; i < formArray.length; i++)
      localStorage.setItem(
        `form-residente-${i}`,
        JSON.stringify(formArray.at(i).value)
      );

    let index = formArray.length;
    while (localStorage.getItem(`form-residente-${index}`)) {
      localStorage.removeItem(`form-residente-${index}`);
      index++;
    }
  }

  get residenteControls() {
    return this.form as FormArray;
  }

  getControl(residente: AbstractControl, campo: string) {
    return residente.get(campo) as FormControl;
  }

  getFormGroup(residente: AbstractControl) {
    return residente as FormGroup;
  }

  getNameStorage(i: number) {
    return `form-residente-${i}`;
  }

  isTouched(residente: AbstractControl) {
    if (residente instanceof FormGroup) {
      let isTouched = false;
      Object.keys(residente.controls).forEach((campo) => {
        if (residente.get(campo).touched && residente.get(campo).invalid)
          isTouched = true;
      });
      return isTouched;
    }
    return false;
  }
}
