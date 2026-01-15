import { Component } from '@angular/core';
import { PersonTimesheet, TimesheetData } from './models/timesheet.model';
import { OcrService } from './services/ocr.service';
import { DataParsingService } from './services/data-parsing.service';
import { ExcelExportService } from './services/excel-export.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'Timesheet Parser';
  
  currentStep: 'upload' | 'processing' | 'review' | 'complete' = 'upload';
  allTimesheets: TimesheetData[] = [];
  currentTimesheet: TimesheetData | null = null;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private ocrService: OcrService,
    private parsingService: DataParsingService,
    private excelService: ExcelExportService
  ) {}

  async onImagesSelected(images: { front: string, back: string }): Promise<void> {
    this.isProcessing = true;
    this.errorMessage = '';
    this.currentStep = 'processing';

    try {
      // Extract text from both images
      const frontText = await this.ocrService.extractTextFromImage(images.front);
      const backText = await this.ocrService.extractTextFromImage(images.back);

      // Parse the extracted text
      const parsedData = this.parsingService.parseTimesheetData(frontText, backText);
      
      // Clean the data
      this.currentTimesheet = this.parsingService.cleanData(parsedData);
      
      // Move to review step
      this.currentStep = 'review';
    } catch (error) {
      console.error('Error processing images:', error);
      this.errorMessage = 'Failed to process images. Please try again.';
      this.currentStep = 'upload';
    } finally {
      this.isProcessing = false;
    }
  }

  onDataConfirmed(data: TimesheetData): void {
    // Add to collection
    this.allTimesheets.push(data);
    this.successMessage = `Timesheet for ${data.name} has been processed successfully!`;
    
    // Reset for next person
    this.currentTimesheet = null;
    this.currentStep = 'complete';
  }

  onDataCancelled(): void {
    this.currentTimesheet = null;
    this.currentStep = 'upload';
  }

  addAnotherPerson(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.currentStep = 'upload';
  }

  exportToExcel(): void {
    if (this.allTimesheets.length === 0) {
      this.errorMessage = 'No timesheets to export';
      return;
    }

    try {
      this.excelService.exportToExcel(this.allTimesheets);
      this.successMessage = 'Excel file downloaded successfully!';
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.errorMessage = 'Failed to export to Excel';
    }
  }

  exportToCSV(): void {
    if (this.allTimesheets.length === 0) {
      this.errorMessage = 'No timesheets to export';
      return;
    }

    try {
      this.excelService.exportToCSV(this.allTimesheets);
      this.successMessage = 'CSV file downloaded successfully!';
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      this.errorMessage = 'Failed to export to CSV';
    }
  }

  resetAll(): void {
    this.allTimesheets = [];
    this.currentTimesheet = null;
    this.currentStep = 'upload';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
