import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { TimesheetData } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  exportToExcel(timesheets: TimesheetData[], filename: string = 'timesheets'): void {
    const workbook = XLSX.utils.book_new();

    timesheets.forEach((timesheet, index) => {
      const worksheetData = this.prepareWorksheetData(timesheet);
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },  // Day
        { wch: 10 }, // In 1
        { wch: 10 }, // Out 1
        { wch: 10 }, // In 2
        { wch: 10 }, // Out 2
        { wch: 10 }, // In 3
        { wch: 10 }  // Out 3
      ];

      const sheetName = timesheet.name || `Person ${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  private prepareWorksheetData(timesheet: TimesheetData): any[][] {
    const data: any[][] = [];
    
    // Header information
    data.push(['Name:', timesheet.name]);
    data.push(['Payroll ID:', timesheet.payrollId]);
    data.push(['Department:', timesheet.department]);
    data.push(['Job:', timesheet.job]);
    data.push(['Pay Period:', timesheet.payPeriod]);
    data.push([]); // Empty row
    
    // Column headers
    data.push(['Day', 'IN', 'OUT', 'IN', 'OUT', 'IN', 'OUT']);
    
    // Time entries
    timesheet.entries.forEach(entry => {
      data.push([
        entry.day,
        entry.inTime1,
        entry.outTime1,
        entry.inTime2,
        entry.outTime2,
        entry.inTime3,
        entry.outTime3
      ]);
    });
    
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
  exportToCSV(timesheets: TimesheetData[], filename: string = 'timesheets'): void {
    let csvContent = '';
    
    timesheets.forEach((timesheet, index) => {
      if (index > 0) csvContent += '\n\n';
      
      csvContent += `Name:,${timesheet.name}\n`;
      csvContent += `Payroll ID:,${timesheet.payrollId}\n`;
      csvContent += `Department:,${timesheet.department}\n`;
      csvContent += `Job:,${timesheet.job}\n`;
      csvContent += `Pay Period:,${timesheet.payPeriod}\n\n`;
      csvContent += 'Day,IN,OUT,IN,OUT,IN,OUT\n';
      
      timesheet.entries.forEach(entry => {
        csvContent += `${entry.day},${entry.inTime1},${entry.outTime1},${entry.inTime2},${entry.outTime2},${entry.inTime3},${entry.outTime3}\n`;
      });
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
