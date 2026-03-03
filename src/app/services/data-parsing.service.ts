import { Injectable } from '@angular/core';
import { TimesheetData, TimesheetEntry } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class DataParsingService {

  parseTimesheetData(frontText: string, backText: string): TimesheetData {
    try {
      const lines = (frontText + '\n' + backText).split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Initialize with default values
      const data: TimesheetData = {
        name: '',
        payrollId: '',
        department: '',
        job: '',
        payPeriod: '',
        entries: []
      };

      // Extract header information with multiple patterns
      data.name = this.extractField(lines, ['NAME', 'name', 'employee', 'EMPLOYEE']) || 'Unknown';
      data.payrollId = this.extractField(lines, ['PAYROLL ID', 'payroll', 'ID', 'employee id', 'EMP ID']) || '';
      data.department = this.extractField(lines, ['DEPARTMENT', 'dept', 'DEPT']) || '';
      data.job = this.extractField(lines, ['JOB', 'job', 'position', 'POSITION', 'title']) || '';
      data.payPeriod = this.extractField(lines, ['PAY PERIOD', 'period', 'PERIOD', 'date range', 'DATE']) || '';

      // Extract time entries with improved error handling
      data.entries = this.extractTimeEntries(lines);

      return data;
    } catch (error) {
      console.error('Error parsing timesheet:', error);
      // Return minimal valid structure
      return {
        name: 'Parse Error',
        payrollId: '',
        department: '',
        job: '',
        payPeriod: '',
        entries: []
      };
    }
  }

  private extractField(lines: string[], keywords: string[]): string {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const keyword of keywords) {
        if (lowerLine.includes(keyword.toLowerCase())) {
          // Try multiple extraction patterns
          
          // Pattern 1: Colon separator (Name: John Doe)
          const colonParts = line.split(/[:]/);  
          if (colonParts.length > 1) {
            const value = colonParts.slice(1).join(':').trim();
            if (value) return value;
          }
          
          // Pattern 2: After keyword with optional colon (Name John Doe)
          const afterKeyword = new RegExp(keyword + '\\s*:?\\s*(.+)', 'i');
          const match1 = line.match(afterKeyword);
          if (match1 && match1[1] && match1[1].trim()) {
            return match1[1].trim();
          }
          
          // Pattern 3: Value on next line or same line
          const spacePattern = new RegExp(keyword + '\\s+([\\w\\s.-]+)', 'i');
          const match2 = line.match(spacePattern);
          if (match2 && match2[1]) {
            return match2[1].trim();
          }
        }
      }
    }
    return '';
  }

  private extractTimeEntries(lines: string[]): TimesheetEntry[] {
    const entries: TimesheetEntry[] = [];
    // More flexible time pattern: matches 7:30, 730, 07:30, etc.
    const timePattern = /(\d{1,2})[:]?(\d{2})/g;
    
    try {
      // Look for lines with day numbers and times
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Multiple day matching patterns
        // Pattern 1: Day at start ("1 8:00 17:00")
        let dayMatch = line.match(/^(\d{1,2})[\s|\t]/);
        // Pattern 2: Day with separator ("Day 1: 8:00")
        if (!dayMatch) {
          dayMatch = line.match(/day\s*(\d{1,2})/i);
        }
        // Pattern 3: Just a number followed by times
        if (!dayMatch) {
          dayMatch = line.match(/^(\d{1,2})(?=[:\s]\d)/);
        }
        
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (day >= 1 && day <= 31) {
            const times: string[] = [];
            const matches = Array.from(line.matchAll(timePattern));
            
            for (const match of matches) {
              const hour = parseInt(match[1]);
              const minute = match[2];
              
              // Validate time
              if (hour >= 0 && hour <= 23 && parseInt(minute) >= 0 && parseInt(minute) <= 59) {
                times.push(`${hour.toString().padStart(2, '0')}:${minute}`);
              }
            }
            
            // Only add entry if we found at least one valid time
            if (times.length > 0) {
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
      }
    } catch (error) {
      console.error('Error extracting time entries:', error);
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
