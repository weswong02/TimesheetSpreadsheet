# PDF Support Documentation

## Overview

The Timesheet Parser now fully supports PDF files in addition to image formats (JPEG, PNG, WebP, HEIC). PDF files are automatically converted to high-quality images before being sent to the AI for processing.

## How It Works

### 1. **PDF Upload**
- Select any upload option (single or dual mode)
- Choose a PDF file from your computer
- The app uses PDF.js to convert PDF pages to PNG images

### 2. **Automatic Processing**
- **Single Mode**: All PDF pages are combined into one vertical image
- **Dual Mode**: First page = front, second page = back
- Conversion happens instantly in your browser
- High resolution (2x scale) for better OCR accuracy

### 3. **AI Processing**
- Converted images are sent to GPT-4 Vision
- Same high-quality extraction as image uploads
- No loss in accuracy

## Usage Examples

### Example 1: Single-Page PDF (Combined Front & Back)
```
1. Select "Single scan with both sides"
2. Upload your 1-page PDF
3. Click "Confirm & Start Processing"
```

### Example 2: Two-Page PDF (Separate Front & Back)
```
1. Select "Two separate images (front & back)"
2. Upload 2-page PDF as "front" (both pages will be used)
   OR upload separate PDFs for front and back
3. Click "Confirm & Start Processing"
```

### Example 3: Multi-Page PDF
```
1. Select "Single scan with both sides"
2. Upload your PDF (all pages will be combined)
3. Click "Confirm & Start Processing"
```

## Technical Details

### PDF.js Library
- **Version**: 3.11.174
- **CDN Worker**: Loaded from cdnjs.cloudflare.com
- **No installation needed**: Worker loaded automatically

### Conversion Process
1. PDF → ArrayBuffer (binary data)
2. PDF.js renders each page to HTML canvas
3. Canvas → PNG image (base64 data URL)
4. Multiple pages stacked vertically if needed
5. High-res rendering (2x scale) for clarity

### Browser Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

## Advantages of PDF Upload

### 1. **Document Scanning Apps**
Most scanning apps export to PDF by default:
- Microsoft Lens → PDF
- Adobe Scan → PDF
- iOS Notes → PDF
- Google Drive Scanner → PDF

### 2. **Better Quality**
- PDFs maintain document structure
- Vector text where applicable
- No JPEG compression artifacts
- Consistent white balance

### 3. **Multi-Page Support**
- Upload entire documents at once
- Automatic page combination
- No need to split files

### 4. **Professional Workflow**
- Standard office format
- Easy to email/share
- Archival quality

## Best Practices

### ✅ DO:
- Use high-quality scanner apps
- Scan in color (helps with red/pink ink)
- Ensure good lighting when scanning
- Keep PDF file size reasonable (<10MB)
- Use 300 DPI or higher when scanning

### ❌ DON'T:
- Don't use password-protected PDFs
- Don't use heavily compressed PDFs
- Don't use PDFs with multiple timesheets per page
- Don't use scanned PDFs at very low resolution (<150 DPI)

## Troubleshooting

### "Failed to process PDF file"
- **Cause**: Corrupted or unsupported PDF format
- **Solution**: Re-scan the document or convert to image format

### "PDF only has one page" (in dual mode)
- **Cause**: Trying to use dual mode with a single-page PDF
- **Solution**: Switch to "Single scan with both sides" mode

### Poor extraction quality
- **Cause**: Low-resolution PDF scan
- **Solution**: Re-scan at higher resolution (300 DPI recommended)

### Slow processing
- **Cause**: Very large PDF file or many pages
- **Solution**: 
  - Reduce PDF file size
  - Split into separate front/back PDFs
  - Use image format instead

## Cost Considerations

### PDF vs Image Costs
- **Image upload**: ~$0.01 per image
- **PDF upload**: Same cost (converted to images)
- **Multi-page PDF**: Cost = number of pages sent to AI
  - Single mode: All pages as one image ≈ $0.01-0.02
  - Dual mode: 2 pages ≈ $0.02

### Optimization Tips
- Use single-mode for combined scans (cheaper)
- Compress PDFs before upload (faster, not cheaper)
- Batch process multiple timesheets together

## Examples from Popular Apps

### Microsoft Lens
```
1. Scan timesheet with Microsoft Lens
2. Export as PDF
3. Upload to Timesheet Parser (single mode)
4. ✅ Works perfectly!
```

### iOS Notes App
```
1. Open Notes → Scan Documents
2. Scan both sides
3. Share → Save as PDF
4. Upload to Timesheet Parser (single mode)
5. ✅ Works perfectly!
```

### Adobe Scan
```
1. Scan with Adobe Scan
2. Save as PDF
3. Upload to Timesheet Parser (single or dual mode)
4. ✅ Works perfectly!
```

## Support

If you encounter issues with PDF processing:
1. Check the browser console for error messages
2. Try converting PDF to PNG/JPEG first
3. Verify PDF is not corrupted (open in PDF reader)
4. Ensure PDF is not password-protected
5. Contact support with specific error details

---

**Remember**: PDF support is seamless - just upload and let the app handle the conversion automatically!
