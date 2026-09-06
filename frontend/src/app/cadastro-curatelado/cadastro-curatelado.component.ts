import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validarCpf, validarData } from '../shared/validators.service';
import { FormService, FormName } from '../tutorial/form.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DadosCadastraisService } from '../shared/dados-cadastrais.service';

@Component({
  selector: 'app-cadastro-curatelado',
  templateUrl: './cadastro-curatelado.component.html',
  styleUrls: ['./cadastro-curatelado.component.scss'],
})
export class CadastroCurateladoComponent implements OnInit {
  form: FormGroup;
  formName: FormName = 'curatelado';
  step: number;
  editMode = false;
  id: number;
  validators = {
    nome: [Validators.required],
    parentesco: [Validators.required],
    cpf: [Validators.required, Validators.minLength(11), validarCpf], // 11 CPF + 2 pontos + 1 traço
    rg: [Validators.required, Validators.minLength(9)],
    estado_civil: [Validators.required],
    data_nascimento: [Validators.required, validarData],
    data_obito: [validarData],
  };

  constructor(
    private formService: FormService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private dadosCadastraisService: DadosCadastraisService
  ) {}

  ngOnInit(): void {
    // verifica se é editMode
    this.route.params.subscribe((params: Params) => {
      const id = Number(+params['id']);
      if (id) this.id = id;
      this.editMode = this.id != null;
    });
    if (this.editMode) this.fetchCuratelado(this.id);

    // se o formCuratelado existir e contiver a propriedade nome
    if (
      this.formService.getFormCuratelado() &&
      this.formService.getFormCuratelado().contains('nome')
    ) {
      this.form = this.formService.getFormCuratelado();

      // se o form não tiver validadores (provavelmente foi preenchido pelo localStorage)
      if (!this.form.controls['nome'].validator) {
        this.setaValidadores();
      }
      this.formService.setFormCuratelado(this.form);
    } else {
      // adiciona os FormControls iniciados com null do form instanciando com os validadores
      this.form = new FormGroup({});
      Object.keys(this.validators).forEach((campo) => {
        this.form.addControl(
          campo,
          new FormControl(null, this.validators[campo])
        );
      });

      this.formService.setFormCuratelado(this.form);
    }
  }

  ngAfterViewInit() {
    if (!this.form.controls['nome'].validator) this.setaValidadores();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  setaValidadores(): void {
    Object.keys(this.form.controls).forEach((campo) => {
      this.form.controls[campo].setValidators(this.validators[campo]);
      if (this.form.controls[campo].value !== null)
        this.form.controls[campo].markAsTouched();
      this.form.controls[campo].updateValueAndValidity();
    });
  }

  fetchCuratelado(id: number) {
    this.dadosCadastraisService.fetch('curatelado', id).subscribe({
      next: (curatelado) => {
        this.form.patchValue(curatelado);
        this.formService.setFormCuratelado(this.form);
      },
      error: (error) => {
        this.form.reset();
        localStorage.removeItem('form-curatelado');
        this.router.navigate(['curatelado/']);
      },
    });
  }

  ngOnDestroy() {
    this.formService.setFormCuratelado(this.form);
  }
}
