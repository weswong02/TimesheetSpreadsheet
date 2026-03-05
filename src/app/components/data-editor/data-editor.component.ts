import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimesheetData, TimesheetEntry } from '../../models/timesheet.model';

@Component({
  selector: 'app-data-editor',
  templateUrl: './data-editor.component.html',
  styleUrls: ['./data-editor.component.scss'],
  standalone: false
})
export class DataEditorComponent {
  @Input() data!: TimesheetData;
  @Input() hourlyRate: number = 21;
  @Output() hourlyRateChange = new EventEmitter<number>();
  @Output() dataConfirmed = new EventEmitter<TimesheetData>();
  @Output() dataCancelled = new EventEmitter<void>();

  onRateChange(value: number): void {
    this.hourlyRate = value;
    this.hourlyRateChange.emit(value);
  }

  // ─── Time helpers ──────────────────────────────────────────────────────────

  /** Convert "HH:MM" to total minutes, returns 0 on invalid input. */
  timeToMinutes(time: string): number {
    if (!time) return 0;
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  /** Minutes between one IN/OUT pair. Returns 0 if either is missing or diff is negative. */
  calcPairMinutes(inTime: string, outTime: string): number {
    if (!inTime || !outTime) return 0;
    const diff = this.timeToMinutes(outTime) - this.timeToMinutes(inTime);
    return diff > 0 ? diff : 0;
  }

  /** Total minutes worked for a single day across all three IN/OUT pairs.
   *  Pairs are matched sequentially from non-empty values so a single
   *  clock-in (col 1) paired with a clock-out in any column still calculates.
   */
  calcDayMinutes(entry: TimesheetEntry): number {
    const ins  = [entry.inTime1,  entry.inTime2,  entry.inTime3 ].filter(t => !!t);
    const outs = [entry.outTime1, entry.outTime2, entry.outTime3].filter(t => !!t);
    const pairs = Math.min(ins.length, outs.length);
    let total = 0;
    for (let i = 0; i < pairs; i++) {
      total += this.calcPairMinutes(ins[i], outs[i]);
    }
    return total;
  }

  /** Total hours (decimal) worked for a single day. */
  calcDayHours(entry: TimesheetEntry): number {
    return this.calcDayMinutes(entry) / 60;
  }

  /** Dollar pay for a single day. */
  calcDayPay(entry: TimesheetEntry): number {
    return this.calcDayHours(entry) * this.hourlyRate;
  }

  /** Sum of hours across all days. */
  calcTotalHours(): number {
    return this.data.entries.reduce((sum, e) => sum + this.calcDayHours(e), 0);
  }

  /** Total pay across all days. */
  calcTotalPay(): number {
    return this.calcTotalHours() * this.hourlyRate;
  }

  /**
   * Human-readable breakdown string for a day, e.g.
   *   "08:00→17:00 = 9.00h  +  12:00→13:00 = 1.00h"
   */
  calcDayBreakdown(entry: TimesheetEntry): string {
    const ins  = [entry.inTime1,  entry.inTime2,  entry.inTime3 ].filter(t => !!t);
    const outs = [entry.outTime1, entry.outTime2, entry.outTime3].filter(t => !!t);
    const pairs = Math.min(ins.length, outs.length);
    const parts: string[] = [];
    for (let i = 0; i < pairs; i++) {
      const mins = this.calcPairMinutes(ins[i], outs[i]);
      const hrs = (mins / 60).toFixed(2);
      parts.push(`${ins[i]}→${outs[i]} = ${hrs}h`);
    }
    return parts.length ? parts.join(' + ') : '—';
  }

  /** Format decimal hours to 2 dp. */
  formatHours(hours: number): string {
    return hours.toFixed(2);
  }

  /** Format dollar amount. */
  formatCurrency(amount: number): string {
    return '$' + amount.toFixed(2);
  }

  // ─── Entry management ──────────────────────────────────────────────────────

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
