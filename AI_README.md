# Timesheet Parser - AI-Powered Edition

An intelligent timesheet data extraction application that uses Google Gemini to parse timesheet images and export to Excel/CSV.

## Features

- 🤖 **AI-Powered Parsing**: Uses Google Gemini to intelligently extract timesheet data
- 📸 **Flexible Upload**: Supports images (JPEG, PNG, WebP, HEIC) and PDF files
- 📄 **PDF Support**: Upload PDF scans directly - automatically converted to images
- ✅ **Manual Confirmation**: Review images before processing
- ✏️ **Editable Data**: Review and edit extracted data before exporting
- 👥 **Multi-Person Support**: Process multiple timesheets in one session
- 📊 **Export Options**: Export to Excel or CSV format
- 🔒 **Secure**: API keys stored locally in your browser

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Angular framework
- PDF.js for PDF processing
- SheetJS for Excel export

### 2. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy the key (starts with `AIza...`)

### 3. Configure API Key

1. Run the development server: `npm start`
2. Click the **⚙️ Settings** button in the top right
3. Paste your Gemini API key
4. Click **Save Settings**

Your API key is stored securely in your browser's localStorage and is never sent to any server except Google's Gemini API.

## Usage

### Running the App

```bash
npm start
```

The app will open at `http://localhost:4200`

### Parsing a Timesheet

1. **Upload Images**
   - **Option A - Two Separate Images:**
     - Select "Two separate images (front & back)"
     - Drag and drop or click to select front image
     - Drag and drop or click to select back image
   - **Option B - Single Combined Scan (PDF or Image):**
     - Select "Single scan with both sides"
     - Upload one PDF or image file containing both front and back
     - PDF files are automatically converted to high-quality images
   - Click **Confirm & Start Processing**

2. **Wait for AI Processing**
   - The app sends images to Google Gemini
   - AI extracts structured timesheet data
   - Usually takes 5-10 seconds

3. **Review & Edit**
   - Check extracted data for accuracy
   - Edit any fields if needed
   - Add or remove time entries
   - Click **Confirm Data** when satisfied

4. **Export**
   - Add more people or export current data
   - Choose **Export to Excel** or **Export to CSV**

## Why AI Instead of OCR?

Traditional OCR (like Tesseract.js) extracts raw text but struggles with:
- Complex layouts
- Varied formatting
- Handwritten text
- Low-quality images

**Google Gemini advantages:**
- Understands context and structure
- Handles varied formats automatically
- More accurate on handwritten text
- Extracts data directly into structured format
- No need for complex parsing logic

## Cost

Google Gemini pricing (as of 2026):
- Generous free tier available with Gemini Flash
- Very affordable for occasional use!

## Technical Stack

- **Angular 17**: Frontend framework
- **TypeScript**: Type-safe development
- **Google Gemini**: AI vision model
- **SheetJS (xlsx)**: Excel file generation
- **RxJS**: Reactive programming

## Project Structure

```
src/app/
├── components/
│   ├── image-upload/       # Image upload with drag-drop
│   ├── data-editor/        # Editable timesheet table
│   └── settings/           # API key configuration
├── services/
│   ├── ocr.service.ts      # Gemini API integration
│   ├── data-parsing.service.ts  # Data validation
│   └── excel-export.service.ts  # Excel/CSV export
└── models/
    └── timesheet.model.ts  # TypeScript interfaces
```

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## API Key Security

- ✅ Stored in browser localStorage only
- ✅ Never sent to any server except Google's Gemini API
- ✅ Can be cleared anytime in Settings
- ⚠️ Do not commit API keys to version control
- ⚠️ Do not share your API key with others

## Troubleshooting

### "Gemini API key not configured"
- Go to Settings and enter your API key
- Make sure you saved it

### "Failed to parse timesheet with Gemini"
- Check your API key is valid
- Check your internet connection
- Try with clearer/higher quality images

### Poor Extraction Results / Low Confidence Warning

The app now shows confidence levels for extractions. If you see warnings:

**Common Causes:**
- Poor image quality (blurry, dark, angled)
- Difficult handwriting (especially red/pink ink)
- Shadows or glare on the timesheet
- Low contrast between paper and ink

**Solutions:**
1. **Retake photos** with better lighting and positioning
2. **Read IMAGE_QUALITY_TIPS.md** for detailed photography guidance
3. **Manually correct** extracted data in the review screen
4. **Use a document scanning app** (Microsoft Lens, Adobe Scan) instead of camera

**What the confidence levels mean:**
- 🟢 **High**: Data extraction looks good, but still review
- 🟡 **Medium**: Some uncertain readings, carefully review highlighted entries
- 🔴 **Low**: Many difficult readings, expect significant corrections needed

**Red/Pink Ink Issues:**
Handwritten times in red or pink ink are significantly harder for OCR to read. Consider:
- Taking photos with extra bright lighting
- Using a scanning app with contrast enhancement
- Being extra careful when reviewing those entries

### Images/PDFs not uploading
- Supported formats: JPEG, JPG, PNG, WebP, HEIC, PDF
- Maximum file size depends on browser limits (usually 10MB+)
- **PDF scans:** Fully supported! Upload your PDF scan directly
- **Combined scans:** If your scan (PDF or image) includes both front and back on one page, select "Single scan with both sides" mode
- For best results, use high-quality scans from document scanning apps

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues or questions, please check:
- Gemini API documentation: https://ai.google.dev/docs
- Angular documentation: https://angular.io/docs
