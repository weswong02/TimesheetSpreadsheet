import { Injectable } from '@angular/core';
import { TimesheetData } from '../models/timesheet.model';

export type OcrProvider = 'gemini';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  // Gemini configuration
  private geminiApiKey: string = '';
  private geminiModel = 'gemini-flash-latest';
  private geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    // Auto-load saved API key from localStorage so the user never has to re-enter it
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      this.geminiApiKey = savedKey;
    }
  }

  setApiKey(_provider: OcrProvider, key: string): void {
    this.geminiApiKey = key;
  }

  getApiKey(_provider: OcrProvider): string {
    return this.geminiApiKey;
  }

  async parseTimesheetWithAI(frontImage: string, backImage: string): Promise<TimesheetData> {
    return this.parseWithGemini(frontImage, backImage);
  }


  private async parseWithGemini(frontImage: string, backImage: string): Promise<TimesheetData> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured. Please set your API key in the settings.');
    }

    // Check if it's the same image (combined scan mode)
    const isCombinedScan = frontImage === backImage;

    const systemPrompt = `You are an expert at extracting timesheet data from physical timecard images with handwritten entries. 

VISUAL LAYOUT - PHYSICAL DESCRIPTION:
The timesheet is divided into clear vertical columns with grid lines:

CRITICAL: COLUMN 1 CONTAINS BOTH DAY AND FIRST IN TIME IN THE SAME CELL
┌─────────────────────────────────────────────────────────────────────┐
│ Column 1 (Contains TWO pieces of info in the SAME cell):           │
│   - DAY NUMBER: "01", "02", "03"... rotated 90° COUNTER-CLOCKWISE  │
│     (reads from BOTTOM to TOP when viewed normally)                 │
│   - FIRST IN TIME: "09:16" written normally (horizontal)            │
│   Example: In one cell you'll see "01 09:16" where:                 │
│   - "01" is sideways (rotated CCW)                                  │
│   - "09:16" is normal horizontal text                               │
│                                                                      │
│ Column 2:   OUT time for first shift (written normally)            │
│ Column 3:   IN time for second shift (written normally)            │
│ Column 4:   OUT time for second shift (written normally)           │
│ Column 5:   IN time for third shift (written normally)             │
│ Column 6:   OUT time for third shift (written normally)            │
└─────────────────────────────────────────────────────────────────────┘

HOW TO READ COLUMN 1:
When you look at the FIRST column, you will see BOTH:
1. A day number rotated 90° counter-clockwise (sideways text)
   - "01" appears sideways, reading from bottom-to-top
   - "16" appears sideways, reading from bottom-to-top
2. A time written normally (horizontal)
   - "09:16" appears as normal horizontal text
   - "08:45" appears as normal horizontal text

THEY ARE IN THE SAME CELL/BOX!

VISUAL REPRESENTATION:
Looking at the first column for day 1:
┌──────────────┐
│ 0  09:16     │  ← "01" is rotated CCW (sideways), "09:16" is horizontal
│ 1            │     BOTH are in this same cell
└──────────────┘

The "01" reads from BOTTOM to TOP (or RIGHT to LEFT if you imagine tilting your head right).
The "09:16" reads normally LEFT to RIGHT.

EXTRACTION ALGORITHM:
For EACH horizontal row in the grid:

STEP 1: Look at the FIRST column (far left)
   → This column contains BOTH the day number AND the first IN time in the SAME cell
   → The DAY number is rotated 90° COUNTER-CLOCKWISE (sideways text)
   → Read the rotated day from BOTTOM to TOP (or RIGHT to LEFT)
   → Example: You see "01 09:16" in one cell
     * "01" is sideways (rotated CCW) = Day 01
     * "09:16" is horizontal (normal) = First IN time
   → Separate these two pieces of information

STEP 2: Continue in the FIRST column (same cell as step 1)
   → This is "IN" time #1 - the HORIZONTAL text in the first column
   → Format: HH:MM written normally (like 09:16, 08:45, 10:30)
   → This time is written right after the rotated day number

STEP 3: Move RIGHT to the SECOND column
   → This is "OUT" time #1 - when they clocked OUT from first shift
   → Format: HH:MM written HORIZONTALLY (like 17:40, 18:00, 16:30)

STEP 4: Move RIGHT to the THIRD column
   → This is "IN" time #2 - when they clocked IN for second shift
   → Format: HH:MM (like 19:06, 20:00)

STEP 5: Move RIGHT to the FOURTH column
   → This is "OUT" time #2 - when they clocked OUT from second shift
   → Format: HH:MM (like 21:06, 23:00)

STEP 6: Move RIGHT to the FIFTH column
   → This is "IN" time #3 - when they clocked IN for third shift
   → Usually blank, but check anyway

STEP 7: Move RIGHT to the SIXTH column (rightmost)
   → This is "OUT" time #3 - when they clocked OUT from third shift
   → Usually blank, but check anyway

INK COLOR INSTRUCTIONS:
- IGNORE ink color completely
- Black ink = valid
- Red ink = valid  
- Pink ink = valid
- Blue ink = valid
- Any color = valid
- If you see ANY handwritten numbers in a cell, extract them regardless of color

HANDWRITING RECOGNITION:
Common number confusions:
- "0" can look like "6" or "8"
- "1" can look like "7"
- "3" can look like "8"
- "4" can look like "9"
- "5" can look like "6"

Time format clues:
- Morning shift IN: Usually 06:00 - 10:00
- Morning shift OUT: Usually 15:00 - 18:00
- Evening shift IN: Usually 18:00 - 20:00
- Evening EXAMPLE - How to read a row where you see "01 09:16" in the first cell:
- Vertical digits (TOP to BOTTOM): "0" then "1" → day: 1
- Horizontal time (LEFT to RIGHT): "09:16" → inTime1: "09:16"
- Next cell right: "17:40" → outTime1: "17:40"
- Next cell right: "19:06" → inTime2: "19:06"
- Next cell right: "21:06" → outTime2: "21:06"
- Next cell right: empty → inTime3: ""
- Next cell right: empty → outTime3: ""

Result: {"day": 1, "inTime1": "09:16", "outTime1": "17:40", "inTime2": "19:06", "outTime2": "21:06", "inTime3": "", "outTime3": ""}

ANOTHER EXAMPLE - If you see "16 08:33" in the first cell:
- Vertical digits: "1" (top) + "6" (bottom) → day: 16
- Horizontal time: "08:33" → inTime1: "08:33"
DO NOT interpret "16 08:33" as "16:08" and "33" - that would be wrong!

OUTPUT FORMAT (JSON only, no markdown):
{
  "name": "from green header section",
  "payrollId": "from green header section",
  "department": "from green header section if visible",
  "job": "from green header section if visible",
  "payPeriod": "from green header section if visible",
  "confidence": "high/medium/low",
  "extractionNotes": "note any difficulties",
  "entries": [
    {written VERTICALLY in the leftmost area - read TOP to BOTTOM
2. Times (HH:MM) are written HORIZONTALLY - read LEFT to RIGHT
3. Day and first time may appear together like "01 09:16" - separate them!
4. Scan HORIZONTALLY across each row for times, not vertically down columns
5. Red/pink ink is NOT an error - include all colored times
6. Empty cells should be "" (empty string), not the day number
7. Day "16" looks like "1" (top) "6" (bottom), NOT "16:00" as a time
      "outTime2": "21:06",
      "inTime3": "",
      "outTime3": "",
      "confidence": "high"
    }
  ]
}

CRITICAL REMINDERS:
1. Day numbers (01-31) are ROTATED 90° CCW and appear in the first cell of each row
2. The first IN time appears in the SAME CELL as the day number (horizontally written)
3. Times (HH:MM) continue in columns to the right: OUT, IN, OUT, IN, OUT
4. Scan HORIZONTALLY across each row, not vertically down columns
5. Red/pink ink is NOT an error - include all colored times
6. Empty cells should be "" (empty string), not the day number

Return ONLY valid JSON, no additional text or markdown formatting.`;

    const combinedUserPrompt = isCombinedScan
      ? `EXTRACTION TASK:
This is a combined timesheet scan showing the complete month on one image. Follow these steps EXACTLY:

1. Locate the green horizontal bar - below this is the data grid
2. Find the header row with "IN", "OUT", "IN", "OUT", "IN", "OUT" labels
3. For EACH row below the headers:
   IMPORTANT: The first cell of each row contains BOTH the day number AND first IN time:
   - Day number is written VERTICALLY (rotated 90° CCW): "0" (top) "1" (bottom) = Day 01
   - First IN time is written HORIZONTALLY: "09:16" = 9:16 AM
   - Example: Cell shows "01 09:16" means day=1, inTime1="09:16"
   
   a) Read VERTICAL day number in first cell (01-31, read top-to-bottom)
   b) Read HORIZONTAL first IN time in SAME cell
   c) Move RIGHT to next cell for first OUT time
   d) Move RIGHT to next cell for second IN time
   e) Move RIGHT to next cell for second OUT time
   f) Move RIGHT to next cell for third IN time (often blank)
   g) Move RIGHT to next cell for third OUT time (often blank)

CRITICAL:
- Day "16" = "1" (top) + "6" (bottom) vertical, NOT time "16:00"
- Times are HORIZONTAL: "09:16" = 9:16 AM
- Include ALL ink colors (black, red, pink, blue - all valid)
- Empty cells should be "" (empty string)

Extract ALL days (1-31) from this single image.`
      : `EXTRACTION TASK:
These are timesheet scans with grid layouts. Follow these steps EXACTLY for EACH image:

1. Locate the green horizontal bar - below this is the data grid
2. Find the header row with "IN", "OUT", "IN", "OUT", "IN", "OUT" labels
3. For EACH row below the headers:
   IMPORTANT: The first cell of each row contains BOTH the day number AND first IN time:
   - Day number is written VERTICALLY (rotated 90° CCW): "0" (top) "1" (bottom) = Day 01
   - First IN time is written HORIZONTALLY: "09:16" = 9:16 AM
   - Example: Cell shows "01 09:16" means day=1, inTime1="09:16"
   
   a) Read VERTICAL day number in first cell (01-31, read top-to-bottom)
   b) Read HORIZONTAL first IN time in SAME cell
   c) Move RIGHT to next cell for first OUT time
   d) Move RIGHT to next cell for second IN time
   e) Move RIGHT to next cell for second OUT time
   f) Move RIGHT to next cell for third IN time (often blank)
   g) Move RIGHT to next cell for third OUT time (often blank)

CRITICAL:
- Day "16" = "1" (top) + "6" (bottom) vertical, NOT time "16:00"
- Times are HORIZONTAL: "09:16" = 9:16 AM
- Include ALL ink colors (black, red, pink, blue - all valid)
- Empty cells should be "" (empty string)

FIRST IMAGE: Extract days 1-15
SECOND IMAGE: Extract days 16-31`;

    // Helper: extract base64 data and mime type from a data URL
    const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } => {
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid image data URL');
      return { mimeType: matches[1], data: matches[2] };
    };

    try {
      const userParts: any[] = [
        { text: combinedUserPrompt }
      ];

      const front = parseDataUrl(frontImage);
      userParts.push({ inlineData: { mimeType: front.mimeType, data: front.data } });

      if (!isCombinedScan) {
        const back = parseDataUrl(backImage);
        userParts.push({ inlineData: { mimeType: back.mimeType, data: back.data } });
      }

      // Prepend system prompt as the first text part (v1 REST doesn't support systemInstruction)
      userParts.unshift({ text: systemPrompt });

      const requestBody = {
        contents: [{ role: 'user', parts: userParts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 16384 }
      };

      const url = `${this.geminiApiUrl}/${this.geminiModel}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': this.geminiApiKey },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = content.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?|```\n?/g, '').trim();
      }

      // Attempt parse; if the response was truncated, try to recover
      let parsedData: TimesheetData;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (parseErr: any) {
        const repaired = this.repairTruncatedJson(jsonText);
        if (repaired) {
          parsedData = repaired;
          if (!parsedData.extractionNotes) {
            parsedData.extractionNotes = 'Response was truncated — some entries near the end may be missing.';
          }
          parsedData.confidence = parsedData.confidence === 'high' ? 'medium' : parsedData.confidence ?? 'low';
        } else {
          throw parseErr; // nothing salvageable, re-throw original error
        }
      }

      // Validate structure
      if (!parsedData.entries) {
        parsedData.entries = [];
      }

      return parsedData;
    } catch (error: any) {
      console.error('Gemini parsing error:', error);
      throw new Error(`Failed to parse timesheet with Gemini: ${error.message}`);
    }
  }

  /**
   * Attempt to recover a TimesheetData object from a JSON string that was cut off
   * mid-stream (e.g. "Unterminated string" errors from LLM token limits).
   *
   * Strategy:
   *  1. Collect all complete entry objects already present using a greedy regex.
   *  2. Scrape top-level scalar fields (name, payrollId, etc.) with simple regexes.
   *  3. Return a valid TimesheetData with whatever was recoverable, or null if
   *     nothing useful was found at all.
   */
  private repairTruncatedJson(raw: string): TimesheetData | null {
    try {
      // ── 1. Extract all complete entry objects ───────────────────────────
      const entries: any[] = [];
      // Match each {...} block inside "entries": [ ... ] — greedy but bounded
      const entryRegex = /\{[^{}]*"day"\s*:\s*\d+[^{}]*\}/g;
      let m: RegExpExecArray | null;
      while ((m = entryRegex.exec(raw)) !== null) {
        try {
          const entry = JSON.parse(m[0]);
          if (typeof entry.day === 'number') {
            entries.push(entry);
          }
        } catch {
          // malformed fragment — skip
        }
      }

      // ── 2. Extract top-level scalar fields ──────────────────────────────
      const extractStr = (field: string): string => {
        const r = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
        return raw.match(r)?.[1] ?? '';
      };

      const name         = extractStr('name');
      const payrollId    = extractStr('payrollId');
      const department   = extractStr('department');
      const job          = extractStr('job');
      const payPeriod    = extractStr('payPeriod');
      const rawConf      = extractStr('confidence') as any;
      const extractionNotes = extractStr('extractionNotes');

      // Accept result only if we got at least a name OR some entries
      if (!name && entries.length === 0) return null;

      return {
        name:             name       || 'Unknown',
        payrollId:        payrollId  || '',
        department:       department || '',
        job:              job        || '',
        payPeriod:        payPeriod  || '',
        confidence:       ['high', 'medium', 'low'].includes(rawConf) ? rawConf : 'low',
        extractionNotes:  extractionNotes || '',
        entries
      };
    } catch {
      return null;
    }
  }

  // Legacy method for backward compatibility
  async extractTextFromImage(_imageData: string): Promise<string> {
    throw new Error('This method is deprecated. Use parseTimesheetWithAI instead.');
  }
}
