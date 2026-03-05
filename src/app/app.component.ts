import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { TimesheetData } from './models/timesheet.model';
import { OcrService } from './services/ocr.service';
import { DataParsingService } from './services/data-parsing.service';
import { ExcelExportService } from './services/excel-export.service';

declare const google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Timesheet Parser';

  currentStep: 'upload' | 'processing' | 'review' | 'complete' = 'upload';
  allTimesheets: TimesheetData[] = [];
  hourlyRate: number = 21;
  currentTimesheet: TimesheetData | null = null;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  showSettings = false;

  // ── Google Sign-In ──
  isSignedIn = false;
  userProfile: { name: string; email: string; picture: string } | null = null;
  googleAvailable = false;
  // Replace YOUR_GOOGLE_CLIENT_ID with the OAuth 2.0 Client ID from
  // https://console.cloud.google.com  →  APIs & Services  →  Credentials
  private readonly GOOGLE_CLIENT_ID = '1035888285079-m1e6qtq9jd5n72b204ig7bcu5g15ossm.apps.googleusercontent.com';

  constructor(
    private ocrService: OcrService,
    private parsingService: DataParsingService,
    private excelService: ExcelExportService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Restore Google session that was saved this browser session
    const saved = sessionStorage.getItem('user_profile');
    if (saved) {
      try {
        this.userProfile = JSON.parse(saved);
        this.isSignedIn = true;
      } catch {}
    }
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    // Skip if placeholder Client ID is still in place
    if (this.GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      this.googleAvailable = false;
      return;
    }

    const tryInit = () => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: (resp: any) => this.ngZone.run(() => this.handleGoogleCredential(resp)),
          auto_select: false
        });

        // Set the flag so Angular renders #google-signin-btn into the DOM,
        // then defer renderButton one tick so the element actually exists.
        this.ngZone.run(() => {
          this.googleAvailable = true;
          setTimeout(() => {
            const btn = document.getElementById('google-signin-btn');
            if (btn) {
              google.accounts.id.renderButton(btn, {
                theme: 'filled_black',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: 300
              });
            }
          }, 0);
        });
      } else {
        setTimeout(tryInit, 500);
      }
    };
    tryInit();
  }

  handleGoogleCredential(response: any): void {
    try {
      // Decode the JWT payload (middle segment)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      this.userProfile = { name: payload.name, email: payload.email, picture: payload.picture };
      this.isSignedIn = true;
      sessionStorage.setItem('user_profile', JSON.stringify(this.userProfile));
    } catch (e) {
      console.error('Failed to parse Google credential', e);
    }
  }

  continueWithoutLogin(): void {
    this.isSignedIn = true;
    this.userProfile = null;
  }

  signOut(): void {
    if (typeof google !== 'undefined' && this.googleAvailable) {
      google.accounts.id.disableAutoSelect();
    }
    this.userProfile = null;
    this.isSignedIn = false;
    sessionStorage.removeItem('user_profile');
  }

  // ── Timesheet workflow ──

  async onImagesConfirmed(images: { front: string; back: string }): Promise<void> {
    this.isProcessing = true;
    this.errorMessage = '';
    this.currentStep = 'processing';
    try {
      const parsedData = await this.ocrService.parseTimesheetWithAI(images.front, images.back);
      this.currentTimesheet = this.parsingService.cleanData(parsedData);
      this.currentStep = 'review';
    } catch (error: any) {
      console.error('Error processing images:', error);
      this.errorMessage = error.message || 'Failed to process images. Please try again.';
      this.currentStep = 'upload';
    } finally {
      this.isProcessing = false;
    }
  }

  onDataConfirmed(data: TimesheetData): void {
    this.allTimesheets.push(data);
    this.successMessage = `Timesheet for ${data.name} has been processed successfully!`;
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
    if (this.allTimesheets.length === 0) { this.errorMessage = 'No timesheets to export'; return; }
    try {
      this.excelService.exportToExcel(this.allTimesheets, 'timesheets', this.hourlyRate);
      this.successMessage = 'Excel file downloaded successfully!';
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.errorMessage = 'Failed to export to Excel';
    }
  }

  exportToCSV(): void {
    if (this.allTimesheets.length === 0) { this.errorMessage = 'No timesheets to export'; return; }
    try {
      this.excelService.exportToCSV(this.allTimesheets, 'timesheets', this.hourlyRate);
      this.successMessage = 'CSV file downloaded successfully!';
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      this.errorMessage = 'Failed to export to CSV';
    }
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  resetAll(): void {
    this.allTimesheets = [];
    this.currentTimesheet = null;
    this.currentStep = 'upload';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
