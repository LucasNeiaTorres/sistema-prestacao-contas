import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss'],
})
export class CollapseComponent {
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Input() loading: boolean = false;

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
