import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sem-receitas-svg',
  templateUrl: './sem-receitas-svg.component.html',
  styleUrls: ['./sem-receitas-svg.component.scss'],
})
export class SemReceitasSvgComponent {
  @Input() width = '100%';
  @Input() height = 'auto';
}
