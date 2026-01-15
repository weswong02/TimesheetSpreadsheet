import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: false
})
export class ImageUploadComponent {
  @Output() imagesSelected = new EventEmitter<{ front: string, back: string }>();
  
  frontImage: string | null = null;
  backImage: string | null = null;
  dragOver = false;

  onFileSelected(event: Event, side: 'front' | 'back'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0], side);
    }
  }

  onDrop(event: DragEvent, side: 'front' | 'back'): void {
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

  private processFile(file: File, side: 'front' | 'back'): void {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageData = e.target?.result as string;
      
      if (side === 'front') {
        this.frontImage = imageData;
      } else {
        this.backImage = imageData;
      }

      // Emit both images when both are selected
      if (this.frontImage && this.backImage) {
        this.imagesSelected.emit({
          front: this.frontImage,
          back: this.backImage
        });
      }
    };
    reader.readAsDataURL(file);
  }

  clearImages(): void {
    this.frontImage = null;
    this.backImage = null;
  }

  get canProceed(): boolean {
    return !!(this.frontImage && this.backImage);
  }
}
