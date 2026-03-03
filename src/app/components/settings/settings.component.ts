import { Component } from '@angular/core';
import { OcrService } from '../../services/ocr.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false
})
export class SettingsComponent {
  geminiApiKey: string = '';
  showApiKey: boolean = false;
  savedMessage: string = '';

  readonly providerInfo = {
    name: 'Google Gemini',
    description: 'Uses Gemini 1.5 Flash for accurate handwriting recognition.',
    setupUrl: 'https://aistudio.google.com/app/apikey'
  };

  constructor(private ocrService: OcrService) {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      this.geminiApiKey = savedKey;
      this.ocrService.setApiKey('gemini', savedKey);
    }
  }

  saveSettings(): void {
    if (this.geminiApiKey.trim()) {
      localStorage.setItem('gemini_api_key', this.geminiApiKey.trim());
      this.ocrService.setApiKey('gemini', this.geminiApiKey.trim());
      this.savedMessage = 'Settings saved successfully!';
      setTimeout(() => this.savedMessage = '', 3000);
    }
  }

  clearSettings(): void {
    this.geminiApiKey = '';
    localStorage.removeItem('gemini_api_key');
    this.ocrService.setApiKey('gemini', '');
    this.savedMessage = 'Gemini settings cleared';
    setTimeout(() => this.savedMessage = '', 3000);
  }

  toggleShowKey(): void {
    this.showApiKey = !this.showApiKey;
  }

  isConfigured(): boolean {
    return !!this.geminiApiKey;
  }
}
