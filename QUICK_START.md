# Quick Start Guide - Timesheet OCR

## 🚀 5-Minute Setup

### 1. Get Your API Key (2 minutes)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy the key (starts with `AIza...`)

### 2. Start the App (1 minute)
```bash
npm install
npm start
```
Open browser to `http://localhost:4200`

### 3. Configure (30 seconds)
1. Click ⚙️ Settings button
2. Paste your API key
3. Click Save

### 4. Take Good Photos (1 minute)
✅ **DO:**
- Use bright, even lighting
- Hold phone directly overhead
- Fill the frame with the timesheet
- Keep it in focus
- Take from a flat surface

❌ **DON'T:**
- Use flash (causes glare)
- Shoot at an angle
- Take blurry photos
- Block the light with your hand
- Use busy backgrounds

### 5. Upload & Process (30 seconds)
1. Upload front image (days 1-15)
2. Upload back image (days 16-31)
3. Click "Confirm & Start Processing"
4. Wait ~5-10 seconds for AI extraction

### 6. Review & Export
1. Check extracted data (yellow/red rows need attention)
2. Fix any errors
3. Click "Confirm Data"
4. Export to Excel or CSV

---

## 📸 Quick Photo Checklist

Before uploading, ask yourself:
- [ ] Can I easily read ALL the handwritten numbers?
- [ ] Is the lighting bright and even?
- [ ] Is the photo straight (not tilted)?
- [ ] Is there no glare or shadows?
- [ ] Is the timesheet in focus?

**If you answered NO to any question, retake the photo!**

---

## 💡 Pro Tips

1. **Batch processing**: Take all photos at once in good lighting
2. **Use scanning apps**: Microsoft Lens or Adobe Scan give better quality than camera
3. **Check before uploading**: Zoom in to verify readability
4. **Red ink warning**: Extra difficult for OCR - review carefully
5. **Save originals**: Don't delete photos until verified

---

## ⚠️ Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Low confidence warning | Retake photos with better lighting |
| Times extracted incorrectly | Red/pink ink? Review manually |
| Missing entries | Photo too dark? Retake with more light |
| Wrong numbers (0→6, 1→7) | Handwriting issue - manual correction needed |
| "API key not configured" | Go to Settings, paste key, save |

---

## 💰 Cost Estimate

Google Gemini has a generous free tier — most personal use is free!

---

## 📚 Need More Help?

- **Detailed photo tips**: Read `IMAGE_QUALITY_TIPS.md`
- **Full documentation**: Read `AI_README.md`
- **Gemini API docs**: https://ai.google.dev/docs

---

**Remember: Good photos = accurate extraction = less manual work!**
