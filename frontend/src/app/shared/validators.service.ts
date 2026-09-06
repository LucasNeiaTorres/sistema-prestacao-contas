import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import { Observable, map } from 'rxjs';

export function validarCpf(cpf: FormControl): {
  [s: string]: boolean;
} {
  if (!cpf.value) return { required: true };

  const nmr_documento = cpf.value.replace(/[^\d]+/g, '');
  if (nmr_documento.length !== 11) return { cpfInvalido: true };

  let sum = 0;
  let remainder: number;
  if (nmr_documento === '00000000000') return { cpfInvalido: true };

  for (let i = 1; i <= 9; i++)
    sum = sum + parseInt(nmr_documento.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(nmr_documento.substring(9, 10)))
    return { cpfInvalido: true };

  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum = sum + parseInt(nmr_documento.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(nmr_documento.substring(10, 11)))
    return { cpfInvalido: true };
  return null;
}

export function validarCnpj(cnpj: FormControl): {
  [s: string]: boolean;
} {
  if (!cnpj.value) return { required: true };

  const nmr_documento = cnpj.value.replace(/[^\d]+/g, '');
  if (nmr_documento.length !== 14) return { cnpjInvalido: true };

  if (
    nmr_documento === '00000000000000' ||
    nmr_documento === '11111111111111' ||
    nmr_documento === '22222222222222' ||
    nmr_documento === '33333333333333' ||
    nmr_documento === '44444444444444' ||
    nmr_documento === '55555555555555' ||
    nmr_documento === '66666666666666' ||
    nmr_documento === '77777777777777' ||
    nmr_documento === '88888888888888' ||
    nmr_documento === '99999999999999'
  ) {
    return { cnpjInvalido: true };
  }

  let tamanho = nmr_documento.length - 2;
  let numeros = nmr_documento.substring(0, tamanho);
  const digitos = nmr_documento.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return { cnpjInvalido: true };

  tamanho = tamanho + 1;
  numeros = nmr_documento.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return { cnpjInvalido: true };

  return null;
}

export function validarDocumento(documento: FormControl): {
  [s: string]: boolean;
} {
  if (!documento.value) return { required: true };
  const nmr_documento = documento.value.replace(/[^\d]+/g, '');

  // valida cpf
  if (nmr_documento.length <= 11) return validarCpf(documento);
  // valida cnpj
  else if (nmr_documento.length <= 14) return validarCnpj(documento);

  return null;
}

export function validarData(data: FormControl): { [s: string]: boolean } {
  if (!data.value) return null;

  const dataSplit = data.value.split('-');
  const dia = parseInt(dataSplit[2], 10);
  const mes = parseInt(dataSplit[1], 10) - 1;
  const ano = parseInt(dataSplit[0], 10);

  const date = new Date(ano, mes, dia);

  if (
    !(
      date.getFullYear() === ano &&
      date.getMonth() === mes &&
      date.getDate() === dia
    )
  ) {
    return { dataInvalida: true };
  }

  // valida se a data é maior que a data atual ou menor que 1800
  const dataAtual = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  if (ano < 1800 || date > dataAtual) return { dataInvalida: true };

  return null;
}

function parseDate(date: string): Date {
  const dataSplit = date.split('-');
  const dia = parseInt(dataSplit[2], 10);
  const mes = parseInt(dataSplit[1], 10);
  const ano = parseInt(dataSplit[0], 10);

  if (!dia || !mes || !ano) return null;

  return new Date(ano, mes - 1, dia);
}

export function deletarErro(control: AbstractControl, erro: string) {
  const currentErrors = control.errors;
  if (currentErrors && currentErrors[erro]) {
    delete currentErrors[erro];
    control.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
  }
}

// para datas required e nome dos campos data_final e data_inicial
export function validarRangeDatas(form: FormGroup) {
  return (control: FormControl): { [s: string]: boolean } => {
    const dataFinal = form.get('data_final');
    if (!dataFinal?.value) return null;

    const dataInicial = form.get('data_inicial');
    if (!dataInicial?.value) return null;

    const dateInicial = parseDate(dataInicial.value);
    const dateFinal = parseDate(dataFinal.value);

    if (dateInicial > dateFinal) return { dataFinalInvalida: true };

    deletarErro(dataInicial, 'dataFinalInvalida');
    deletarErro(dataFinal, 'dataFinalInvalida');

    return null;
  };
}

export function validarSenhas(senha: FormControl): { [s: string]: boolean } {
  if (this.form) {
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!senhaRegex.test(senha.value)) return { senhaInvalida: true };

    const confirmaSenha = this.form.get('confirmaSenha');
    if (confirmaSenha.value !== senha.value && confirmaSenha.touched) {
      confirmaSenha.setErrors({ senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    // deleta o erro se a senha for corrigida
    deletarErro(confirmaSenha, 'senhasDiferentes');
  }
  return null;
}

export function validarSenhasConfirmar(confirmarSenha: FormControl): {
  [s: string]: boolean;
} {
  if (this.form) {
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!senhaRegex.test(confirmarSenha.value)) return { senhaInvalida: true };

    const senha = this.form.get('senha');
    if (senha.value !== confirmarSenha.value && senha.touched) {
      senha.setErrors({ senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    // deleta o erro se a senha for corrigida
    deletarErro(senha, 'senhasDiferentes');
  }
  return null;
}

// os controls devem se chamar: cep, estado, cidade, bairro, logradouro
export function validarCep(
  form: FormGroup,
  http: HttpClient
): AsyncValidatorFn {
  return (
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    const cepControl = form.controls['cep'].value;
    const cep = cepControl?.replace(/[^\d]+/g, '');
    if (cep?.length != 8)
      return new Promise((resolve) => resolve({ null: true }));

    const listaEstados = {
      AC: 'Acre',
      AL: 'Alagoas',
      AP: 'Amapá',
      AM: 'Amazonas',
      BA: 'Bahia',
      CE: 'Ceará',
      DF: 'Distrito Federal',
      ES: 'Espírito Santo',
      GO: 'Goiás',
      MA: 'Maranhão',
      MT: 'Mato Grosso',
      MS: 'Mato Grosso do Sul',
      MG: 'Minas Gerais',
      PA: 'Pará',
      PB: 'Paraíba',
      PR: 'Paraná',
      PE: 'Pernambuco',
      PI: 'Piauí',
      RJ: 'Rio de Janeiro',
      RN: 'Rio Grande do Norte',
      RS: 'Rio Grande do Sul',
      RO: 'Rondônia',
      RR: 'Roraima',
      SC: 'Santa Catarina',
      SP: 'São Paulo',
      SE: 'Sergipe',
      TO: 'Tocantins',
    };
    return http.get('https://viacep.com.br/ws/' + cep + '/json/').pipe(
      map((res) => {
        if (res['erro']) {
          form.controls['estado'].setValue(null);
          form.controls['cidade'].setValue(null);
          form.controls['bairro'].setValue(null);
          form.controls['logradouro'].setValue(null);
          return { cepInvalido: true };
        }
        const sigla = res['uf'];
        const cidade = res['localidade'];
        const bairro = res['bairro'];
        const logradouro = res['logradouro'];

        form.controls['estado'].setValue(listaEstados[sigla]);
        form.controls['cidade'].setValue(cidade);
        if (bairro) form.controls['bairro'].setValue(bairro);
        if (logradouro) form.controls['logradouro'].setValue(logradouro);
        // disable em campos preenchidos?
        return null;
      })
    );
  };
}
