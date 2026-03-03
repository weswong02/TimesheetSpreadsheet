export interface TimesheetEntry {
  day: number;
  inTime1: string;
  outTime1: string;
  inTime2: string;
  outTime2: string;
  inTime3: string;
  outTime3: string;
  confidence?: 'high' | 'medium' | 'low'; // OCR confidence level
}

export interface TimesheetData {
  name: string;
  payrollId: string;
  department: string;
  job: string;
  payPeriod: string;
  entries: TimesheetEntry[];
  confidence?: 'high' | 'medium' | 'low'; // Overall extraction confidence
  extractionNotes?: string; // Any issues or concerns during extraction
}

export interface PersonTimesheet {
  id: string;
  frontImage: string;
  backImage: string;
  data: TimesheetData;
  status: 'uploaded' | 'processing' | 'review' | 'completed';
}
