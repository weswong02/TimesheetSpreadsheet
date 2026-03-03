import { Component, EventEmitter, Output } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: false
})
export class ImageUploadComponent {
  @Output() imagesSelected = new EventEmitter<{ front: string, back: string }>();
  @Output() confirmClicked = new EventEmitter<{ front: string, back: string }>();
  
  frontImage: string | null = null;
  backImage: string | null = null;
  combinedImage: string | null = null;
  dragOver = false;
  showConfirmButton = false;
  uploadMode: 'single' | 'dual' = 'dual';

  constructor() {
    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  onModeChange(): void {
    // Clear all images when switching modes
    this.clearImages();
  }

  onFileSelected(event: Event, side: 'front' | 'back' | 'single'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0], side);
    }
  }

  onDrop(event: DragEvent, side: 'front' | 'back' | 'single'): void {
    event.preventDefault();
    this.dragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0], side);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  private async processFile(file: File, side: 'front' | 'back' | 'single'): Promise<void> {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      alert('Please select a valid image or PDF file (JPEG, PNG, WebP, HEIC, or PDF)');
      return;
    }

    if (!acceptedTypes.includes(file.type.toLowerCase())) {
      alert('Please select a valid image or PDF file (JPEG, PNG, WebP, HEIC, or PDF)');
      return;
    }

    // Handle PDF files
    if (isPDF) {
      await this.processPDFFile(file, side);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageData = e.target?.result as string;
      
      if (side === 'single') {
        this.combinedImage = imageData;
        this.showConfirmButton = true;
      } else if (side === 'front') {
        this.frontImage = imageData;
      } else {
        this.backImage = imageData;
      }

      // Show confirm button when both images are selected (dual mode) or single image (single mode)
      if (this.uploadMode === 'dual') {
        this.showConfirmButton = !!(this.frontImage && this.backImage);
      }
    };
    reader.readAsDataURL(file);
  }

  confirmImages(): void {
    if (this.uploadMode === 'single' && this.combinedImage) {
      // For single image mode, send the same image as both front and back
      this.confirmClicked.emit({
        front: this.combinedImage,
        back: this.combinedImage
      });
    } else if (this.uploadMode === 'dual' && this.frontImage && this.backImage) {
      this.confirmClicked.emit({
        front: this.frontImage,
        back: this.backImage
      });
    }
  }

  clearImages(): void {
    this.frontImage = null;
    this.backImage = null;
    this.combinedImage = null;
    this.showConfirmButton = false;
  }

  get canProceed(): boolean {
    if (this.uploadMode === 'single') {
      return !!this.combinedImage;
    }
    return !!(this.frontImage && this.backImage);
  }

  private async processPDFFile(file: File, side: 'front' | 'back' | 'single'): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // For single mode, combine all pages into one image
      if (side === 'single') {
        const images: string[] = [];
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const pageImage = await this.renderPDFPage(pdf, pageNum);
          images.push(pageImage);
        }
        
        // If multiple pages, stack them vertically
        if (images.length > 1) {
          this.combinedImage = await this.combineImages(images);
        } else {
          this.combinedImage = images[0];
        }
        this.showConfirmButton = true;
      } else {
        // For dual mode, assume first page is front, second is back
        if (pdf.numPages >= 1 && side === 'front') {
          this.frontImage = await this.renderPDFPage(pdf, 1);
        }
        if (pdf.numPages >= 2 && side === 'back') {
          this.backImage = await this.renderPDFPage(pdf, 2);
        } else if (pdf.numPages === 1 && side === 'back') {
          alert('PDF only has one page. For single-page PDFs, please use "Single scan with both sides" mode.');
          return;
        }
        
        if (this.uploadMode === 'dual') {
          this.showConfirmButton = !!(this.frontImage && this.backImage);
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF file. Please try again or use an image file instead.');
    }
  }

  private async renderPDFPage(pdf: any, pageNumber: number): Promise<string> {
    const page = await pdf.getPage(pageNumber);
    const scale = 2.0; // Higher scale for better quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas.toDataURL('image/png');
  }

  private async combineImages(images: string[]): Promise<string> {
    // Create a canvas to combine multiple images vertically
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    // Load all images
    const loadedImages = await Promise.all(
      images.map(src => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      })
    );
    
    // Calculate total height and max width
    const maxWidth = Math.max(...loadedImages.map(img => img.width));
    const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0);
    
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    
    // Draw images vertically
    let currentY = 0;
    for (const img of loadedImages) {
      context.drawImage(img, 0, currentY);
      currentY += img.height;
    }
    
    return canvas.toDataURL('image/png');
  }
}
