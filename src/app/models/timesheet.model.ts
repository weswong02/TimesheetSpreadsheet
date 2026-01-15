export interface TimesheetEntry {
  day: number;
  inTime1: string;
  outTime1: string;
  inTime2: string;
  outTime2: string;
  inTime3: string;
  outTime3: string;
}

export interface TimesheetData {
  name: string;
  payrollId: string;
  department: string;
  job: string;
  payPeriod: string;
  entries: TimesheetEntry[];
}

export interface PersonTimesheet {
  id: string;
  frontImage: string;
  backImage: string;
  data: TimesheetData;
  status: 'uploaded' | 'processing' | 'review' | 'completed';
}
