import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimesheetData } from '../../models/timesheet.model';

@Component({
  selector: 'app-data-editor',
  templateUrl: './data-editor.component.html',
  styleUrls: ['./data-editor.component.scss']
})
export class DataEditorComponent {
  @Input() data!: TimesheetData;
  @Output() dataConfirmed = new EventEmitter<TimesheetData>();
  @Output() dataCancelled = new EventEmitter<void>();

  addEntry(): void {
    this.data.entries.push({
      day: this.data.entries.length + 1,
      inTime1: '',
      outTime1: '',
      inTime2: '',
      outTime2: '',
      inTime3: '',
      outTime3: ''
    });
  }

  removeEntry(index: number): void {
    this.data.entries.splice(index, 1);
  }

  confirmData(): void {
    this.dataConfirmed.emit(this.data);
  }

  cancel(): void {
    this.dataCancelled.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
