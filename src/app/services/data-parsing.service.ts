import { Injectable } from '@angular/core';
import { TimesheetData, TimesheetEntry } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class DataParsingService {

  parseTimesheetData(frontText: string, backText: string): TimesheetData {
    const lines = (frontText + '\n' + backText).split('\n');
    
    // Initialize with default values
    const data: TimesheetData = {
      name: '',
      payrollId: '',
      department: '',
      job: '',
      payPeriod: '',
      entries: []
    };

    // Extract header information
    data.name = this.extractField(lines, ['NAME', 'name']) || '';
    data.payrollId = this.extractField(lines, ['PAYROLL ID', 'payroll']) || '';
    data.department = this.extractField(lines, ['DEPARTMENT', 'dept']) || '';
    data.job = this.extractField(lines, ['JOB', 'job']) || '';
    data.payPeriod = this.extractField(lines, ['PAY PERIOD', 'period']) || '';

    // Extract time entries
    data.entries = this.extractTimeEntries(lines);

    return data;
  }

  private extractField(lines: string[], keywords: string[]): string {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword.toLowerCase())) {
          // Extract value after keyword
          const parts = line.split(/[:]/);
          if (parts.length > 1) {
            return parts[1].trim();
          }
          // Try to find value on same line after keyword
          const regex = new RegExp(keyword + '\\s*[:]?\\s*([^\\s]+)', 'i');
          const match = line.match(regex);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
    }
    return '';
  }

  private extractTimeEntries(lines: string[]): TimesheetEntry[] {
    const entries: TimesheetEntry[] = [];
    const timePattern = /(\d{1,2})[:]?(\d{2})/g;
    
    // Look for lines with day numbers and times
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line starts with a day number (1-31)
      const dayMatch = line.match(/^(\d{1,2})\s/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        if (day >= 1 && day <= 31) {
          const times = [];
          const matches = line.matchAll(timePattern);
          
          for (const match of matches) {
            const hour = match[1].padStart(2, '0');
            const minute = match[2];
            times.push(`${hour}:${minute}`);
          }
          
          entries.push({
            day: day,
            inTime1: times[0] || '',
            outTime1: times[1] || '',
            inTime2: times[2] || '',
            outTime2: times[3] || '',
            inTime3: times[4] || '',
            outTime3: times[5] || ''
          });
        }
      }
    }
    
    return entries;
  }

  // Method to clean and validate data
  cleanData(data: TimesheetData): TimesheetData {
    return {
      ...data,
      name: data.name.replace(/[^a-zA-Z\s]/g, '').trim(),
      payrollId: data.payrollId.replace(/[^a-zA-Z0-9]/g, '').trim(),
      entries: data.entries.map(entry => ({
        ...entry,
        inTime1: this.validateTime(entry.inTime1),
        outTime1: this.validateTime(entry.outTime1),
        inTime2: this.validateTime(entry.inTime2),
        outTime2: this.validateTime(entry.outTime2),
        inTime3: this.validateTime(entry.inTime3),
        outTime3: this.validateTime(entry.outTime3)
      }))
    };
  }

  private validateTime(time: string): string {
    if (!time) return '';
    
    // Match HH:MM format
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
    
    return time; // Return as-is if validation fails, user can edit
  }
}
