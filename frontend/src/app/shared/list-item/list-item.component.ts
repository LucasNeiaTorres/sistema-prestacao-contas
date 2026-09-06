import { Component, EventEmitter, Input, Output } from '@angular/core';
import { delay } from 'rxjs';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent {
  @Input() config: {
    date?: string | Date;
    topLeftText?: string;
    bottonLeftText?: string;
    rightText?: string;
    bottomBorder: boolean;
  };
  @Input() loading: boolean = false;
  @Output() deleteEvent = new EventEmitter<void>();
  @Output() editEvent = new EventEmitter<void>();

  toBeDeleted = false;

  // static readonly deleteAnimationDuration = 300;

  onDelete() {
    // this.toBeDeleted = true;

    // setTimeout(
    //   () => this.deleteEvent.emit(),
    //   ListItemComponent.deleteAnimationDuration
    // );
    this.deleteEvent.emit();
  }

  onEdit() {
    this.editEvent.emit();
  }
}
