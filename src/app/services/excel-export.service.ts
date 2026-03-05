import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { TimesheetData } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  exportToExcel(timesheets: TimesheetData[], filename: string = 'timesheets', hourlyRate: number = 21): void {
    const workbook = XLSX.utils.book_new();

    timesheets.forEach((timesheet, index) => {
      const worksheetData = this.prepareWorksheetData(timesheet, hourlyRate);
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },  // Day
        { wch: 10 }, // In 1
        { wch: 10 }, // Out 1
        { wch: 10 }, // In 2
        { wch: 10 }, // Out 2
        { wch: 10 }, // In 3
        { wch: 10 }, // Out 3
        { wch: 14 }, // Hours
        { wch: 16 }, // Pay
        { wch: 36 }  // Breakdown
      ];

      const sheetName = timesheet.name || `Person ${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  // ─── Calculation helpers (mirrors data-editor logic) ──────────────────────

  private timeToMinutes(time: string): number {
    if (!time) return 0;
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  private calcPairMinutes(inTime: string, outTime: string): number {
    if (!inTime || !outTime) return 0;
    const diff = this.timeToMinutes(outTime) - this.timeToMinutes(inTime);
    return diff > 0 ? diff : 0;
  }

  private calcDayMinutes(entry: any): number {
    const ins  = [entry.inTime1,  entry.inTime2,  entry.inTime3 ].filter((t: string) => !!t);
    const outs = [entry.outTime1, entry.outTime2, entry.outTime3].filter((t: string) => !!t);
    const pairs = Math.min(ins.length, outs.length);
    let total = 0;
    for (let i = 0; i < pairs; i++) total += this.calcPairMinutes(ins[i], outs[i]);
    return total;
  }

  private calcDayBreakdown(entry: any): string {
    const ins  = [entry.inTime1,  entry.inTime2,  entry.inTime3 ].filter((t: string) => !!t);
    const outs = [entry.outTime1, entry.outTime2, entry.outTime3].filter((t: string) => !!t);
    const pairs = Math.min(ins.length, outs.length);
    const parts: string[] = [];
    for (let i = 0; i < pairs; i++) {
      const mins = this.calcPairMinutes(ins[i], outs[i]);
      parts.push(`${ins[i]}→${outs[i]} = ${(mins / 60).toFixed(2)}h`);
    }
    return parts.length ? parts.join(' + ') : '';
  }

  // ─── Worksheet builder ─────────────────────────────────────────────────────

  private prepareWorksheetData(timesheet: TimesheetData, hourlyRate: number = 21): any[][] {
    const data: any[][] = [];

    // Header information
    data.push(['Name:', timesheet.name]);
    data.push(['Payroll ID:', timesheet.payrollId]);
    data.push(['Department:', timesheet.department]);
    data.push(['Job:', timesheet.job]);
    data.push(['Pay Period:', timesheet.payPeriod]);
    data.push(['Hourly Rate:', `$${hourlyRate.toFixed(2)}/hr`]);
    data.push([]); // Empty row

    // Column headers
    data.push(['Day', 'IN', 'OUT', 'IN', 'OUT', 'IN', 'OUT', 'Hours Worked', `Pay (@$${hourlyRate}/hr)`, 'Breakdown']);

    let totalMinutes = 0;

    // Time entries with calculations
    timesheet.entries.forEach(entry => {
      const mins  = this.calcDayMinutes(entry);
      const hours = mins / 60;
      const pay   = hours * hourlyRate;
      totalMinutes += mins;
      data.push([
        entry.day,
        entry.inTime1,
        entry.outTime1,
        entry.inTime2,
        entry.outTime2,
        entry.inTime3,
        entry.outTime3,
        parseFloat(hours.toFixed(2)),
        parseFloat(pay.toFixed(2)),
        this.calcDayBreakdown(entry)
      ]);
    });

    // Totals row
    const totalHours = totalMinutes / 60;
    const totalPay   = totalHours * hourlyRate;
    data.push([]);
    data.push([
      'TOTALS', '', '', '', '', '', '',
      parseFloat(totalHours.toFixed(2)),
      parseFloat(totalPay.toFixed(2)),
      `${totalHours.toFixed(2)}h × $${hourlyRate} = $${totalPay.toFixed(2)}`
    ]);

    return data;
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = `${fileName}_${new Date().getTime()}.xlsx`;
    link.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }

  // Method to generate CSV as alternative
  exportToCSV(timesheets: TimesheetData[], filename: string = 'timesheets', hourlyRate: number = 21): void {
    let csvContent = '';

    timesheets.forEach((timesheet, index) => {
      if (index > 0) csvContent += '\n\n';

      csvContent += `Name:,${timesheet.name}\n`;
      csvContent += `Payroll ID:,${timesheet.payrollId}\n`;
      csvContent += `Department:,${timesheet.department}\n`;
      csvContent += `Job:,${timesheet.job}\n`;
      csvContent += `Pay Period:,${timesheet.payPeriod}\n`;
      csvContent += `Hourly Rate:,$${hourlyRate.toFixed(2)}/hr\n\n`;
      csvContent += `Day,IN,OUT,IN,OUT,IN,OUT,Hours Worked,Pay (@$${hourlyRate}/hr),Breakdown\n`;

      let totalMinutes = 0;

      timesheet.entries.forEach(entry => {
        const mins  = this.calcDayMinutes(entry);
        const hours = mins / 60;
        const pay   = hours * hourlyRate;
        totalMinutes += mins;
        const breakdown = this.calcDayBreakdown(entry);
        csvContent += `${entry.day},${entry.inTime1},${entry.outTime1},${entry.inTime2},${entry.outTime2},${entry.inTime3},${entry.outTime3},${hours.toFixed(2)},${pay.toFixed(2)},"${breakdown}"\n`;
      });

      const totalHours = totalMinutes / 60;
      const totalPay   = totalHours * hourlyRate;
      csvContent += `\nTOTALS,,,,,,,${totalHours.toFixed(2)},${totalPay.toFixed(2)},"${totalHours.toFixed(2)}h × $${hourlyRate} = $${totalPay.toFixed(2)}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().getTime()}.csv`;
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }
}
