# Timesheet Parser

An Angular application that extracts timesheet data from images using OCR (Optical Character Recognition) and exports the data to Excel or CSV format.

## Features

- 📸 **Image Upload**: Upload front and back images of physical timesheet cards
- 🔍 **OCR Processing**: Automatically extract text data using Tesseract.js
- ✏️ **Data Review & Editing**: Review and correct extracted data before finalizing
- 👥 **Multi-Person Support**: Process timesheets for multiple people in one session
- 📊 **Excel Export**: Export all processed timesheets to Excel format
- 📄 **CSV Export**: Alternative CSV export option
- 🎨 **Modern UI**: Clean, responsive interface with progress tracking

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## How to Use

### Step 1: Upload Images
1. Upload the **front** image of the timesheet
2. Upload the **back** image of the timesheet
3. The system will automatically start processing once both images are uploaded

### Step 2: Review & Edit
1. The OCR system will extract the following data:
   - Employee Name
   - Payroll ID
   - Department
   - Job Title
   - Pay Period
   - Time entries (Day, IN/OUT times)
2. Review all extracted data carefully
3. Correct any errors in the editable fields
4. Add or remove time entries as needed
5. Click "Confirm & Continue"

### Step 3: Complete & Export
1. View summary of processed timesheets
2. Choose to:
   - **Add Another Person**: Process another employee's timesheet
   - **Export to Excel**: Download all data as an Excel file
   - **Export to CSV**: Download all data as a CSV file
   - **Start Over**: Clear all data and start fresh

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── image-upload/       # Image upload component
│   │   └── data-editor/        # Data review/editing component
│   ├── models/
│   │   └── timesheet.model.ts  # TypeScript interfaces
│   ├── services/
│   │   ├── ocr.service.ts              # OCR processing
│   │   ├── data-parsing.service.ts     # Data extraction logic
│   │   └── excel-export.service.ts     # Export functionality
│   ├── app.component.*         # Main application component
│   └── app.module.ts          # Angular module configuration
├── assets/                    # Static assets
├── styles.scss               # Global styles
└── index.html               # Main HTML file
```

## Technologies Used

- **Angular 17**: Frontend framework
- **Tesseract.js**: OCR library for text extraction from images
- **SheetJS (xlsx)**: Excel file generation
- **TypeScript**: Type-safe JavaScript
- **SCSS**: Styling

## Tips for Best Results

1. **Image Quality**: Use clear, well-lit photos for better OCR accuracy
2. **Orientation**: Ensure images are properly oriented (not rotated)
3. **Resolution**: Higher resolution images generally produce better results
4. **Review Data**: Always review extracted data as OCR may not be 100% accurate
5. **Time Format**: Ensure times are in HH:MM format (e.g., 08:00, 17:30)

## Troubleshooting

### OCR Not Working
- Check browser console for errors
- Ensure images are in a supported format (JPG, PNG, etc.)
- Try with clearer, higher-resolution images

### Export Not Working
- Check that you have at least one processed timesheet
- Ensure browser allows downloads
- Check browser console for errors

## Future Enhancements

- Cloud OCR integration (Google Vision, AWS Rekognition) for better accuracy
- Batch processing of multiple people at once
- Direct Google Sheets integration
- Historical data storage
- Mobile app version
- Template customization for different timesheet formats

## License

MIT License

## Author

Created for timesheet data extraction and management
