import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sem-prestacao-svg',
  templateUrl: './sem-prestacao-svg.component.html',
  styleUrls: ['./sem-prestacao-svg.component.scss']
})
export class SemPrestacaoSvgComponent {
  @Input() width = '100%';
  @Input() height = 'auto';
}
