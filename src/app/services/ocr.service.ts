import { Injectable } from '@angular/core';
import { createWorker, Worker } from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private worker: Worker | null = null;

  async initializeWorker(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('eng', 1, {
        logger: m => console.log(m)
      });
    }
  }

  async extractTextFromImage(imageData: string): Promise<string> {
    await this.initializeWorker();
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    const { data: { text } } = await this.worker.recognize(imageData);
    return text;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
