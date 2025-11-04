
# Lois's Assistant 🎙️

A voice-activated AI assistant designed specifically for elderly users, with large buttons, clear feedback, and warm interactions.

## Features

✅ **Large "HELP" Button** - Can't miss it, easy to press
✅ **Voice Input** - Just speak your question
✅ **Voice Output** - Hear the answer read aloud
✅ **Written Transcripts** - See everything in large, clear text
✅ **Conversation History** - Review past questions and answers
✅ **Smart Search** - Web search + AI for current events, or pure AI for general knowledge

## Topics Optimized For

- General Knowledge
- Judaism & Jewish traditions
- Medical & Health information
- Current events and news

## Setup Instructions

### 1. Get Your API Keys (Required)

#### OpenAI API Key (Required - $5-10/month typical usage)
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

#### Brave Search API Key (Optional - Free tier: 2,000 searches/month)
1. Go to https://brave.com/search/api/
2. Sign up for free tier
3. Get your API key

### 2. Add API Keys to Softgen

1. Click the **Settings icon** (top right in Softgen)
2. Go to **Environment** tab
3. Add these variables:
   - `OPENAI_API_KEY` = your OpenAI key
   - `BRAVE_SEARCH_API_KEY` = your Brave key (optional)
4. Click **Save**
5. Click **Restart Server** button

### 3. Test the Assistant

1. Click the large green **HELP** button
2. When it says "Listening...", speak your question
3. Wait for the answer (both spoken and written)

## Browser Requirements

- **Chrome** or **Edge** (best voice recognition support)
- **Safari** works but voice recognition may be less accurate
- **Firefox** has limited voice support

## Usage Tips

- Speak clearly and wait for the "Listening..." indicator
- The button turns red while listening
- Answers are automatically read aloud
- You can replay any answer by clicking "Repeat Answer"
- Recent conversations are saved and displayed below

## Cost Estimates

### With Free Tier (Brave Search)
- **0-2000 questions/month**: ~$5-10 (OpenAI only)
- **Over 2000/month**: Add ~$5-10 for Brave premium

### Typical Usage (20-30 questions/day)
- **Monthly cost**: $8-15
- **Per question**: ~$0.01-0.02

## Phase 2 Features (Coming Soon)

- 📞 Contact storage (addresses, phone numbers)
- 🔍 Search your saved contacts
- 👥 Quick dial family members
- 📅 Reminders and calendar integration

## Troubleshooting

### "I need an OpenAI API key..."
- Add `OPENAI_API_KEY` to Environment settings
- Make sure to restart the server

### Voice not working
- Use Chrome or Edge browser
- Check microphone permissions
- Speak clearly after "Listening..." appears

### Preview not loading
- Click "Restart Server" in Settings
- Refresh the preview window

## Support

Need help? Contact Softgen Support or check the documentation.

---

Built with ❤️ for Lois
