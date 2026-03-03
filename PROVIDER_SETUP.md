# Gemini API Setup Guide

This application uses **Google Gemini** for AI-powered timesheet data extraction.

---

## 🎯 Google Gemini

| Provider | Cost | Accuracy | Setup Difficulty |
|----------|------|----------|------------------|
| **Google Gemini** | Free tier available | ⭐⭐⭐⭐⭐ Excellent | Easy |

---

## Setup Steps

### Pros:
- ✅ **Excellent accuracy** for handwritten text
- ✅ Handles rotated text and colored ink
- ✅ Context-aware (understands timesheet structure)
- ✅ Generous free tier
- ✅ Easy setup — no credit card required for free tier

### Getting Your API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key (starts with `AIza...`)
5. In the app: **Settings** → Paste key → **Save Settings**

### Pricing:
- **Free tier**: Generous quota for personal use
- See [Gemini pricing](https://ai.google.dev/pricing) for current details

---

## ⚙️ How It Works

Gemini uses multimodal vision with custom prompts to understand timesheet structure and extract data directly into JSON format. It can distinguish rotated day numbers from times and handles colored ink accurately.

### Privacy:
Your API key is stored in your browser's localStorage. Images are sent directly to Google's Gemini API — nothing goes through any intermediate servers.

---

## 🐛 Troubleshooting

### "API key not configured" error:
- Make sure you saved the settings after entering your API key
- Check the browser console for any errors

### "Failed to parse timesheet with Gemini" error:
- Verify your API key is valid in [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check your internet connection
- Try with a clearer, higher-quality image

### General poor accuracy:
- Use high-quality scans (at least 300 DPI)
- Ensure images are well-lit and in focus
- See `IMAGE_QUALITY_TIPS.md` for photography guidance

---

## 📚 Additional Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
