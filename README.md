# aworkingbear's Assistant 🎙️

A voice-activated AI assistant with large buttons, clear feedback, and warm interactions.

## Features

✅ **Large "HELP" Button** - Can't miss it, easy to press
✅ **Voice Input** - Just speak your question
✅ **Voice Output** - Hear the answer read aloud
✅ **Written Transcripts** - See everything in large, clear text
✅ **Conversation History** - Review past questions and answers
✅ **Smart AI Responses** - Powered by OpenAI (optional) or built-in knowledge base

## Current Status

🎉 **Working NOW** - No API keys required!
- Built-in knowledge base for common questions
- Time, date, Jewish holidays, greetings
- Emergency information
- General conversation

🚀 **Optional Enhancement** - Add OpenAI for advanced AI
- More detailed, conversational answers
- Better understanding of complex questions
- Cost: ~$0.002 per question ($5-10/month typical usage)

## Setup Instructions

### Option 1: Use As-Is (FREE - Already Working!)
**No setup needed!** The assistant works right now with:
- Basic Q&A capabilities
- Time and date
- Jewish holiday information
- Friendly conversation

Just click the HELP button and start asking questions!

---

### Option 2: Add OpenAI for Advanced AI (Recommended)

#### Step 1: Get Your OpenAI API Key

1. Go to **https://platform.openai.com/api-keys**
2. Sign up or log in to your OpenAI account
3. Click **"Create new secret key"**
4. Give it a name like "aworkingbear-assistant"
5. Copy the key (starts with `sk-...`)
   - ⚠️ Save it somewhere safe - you won't see it again!

#### Step 2: Add API Key to Softgen

1. In Softgen, click the **Settings icon** (⚙️ top right)
2. Go to **"Environment"** tab
3. Click **"Add Variable"**
4. Enter:
   - Variable Name: `OPENAI_API_KEY`
   - Value: (paste your `sk-...` key)
5. Click **"Save"**
6. Click **"Restart Server"** button

#### Step 3: Add Billing to OpenAI (Required)

1. Go to **https://platform.openai.com/account/billing**
2. Click **"Add payment method"**
3. Add a credit card
4. Set a spending limit (recommended: $10/month to start)

**Cost Estimates:**
- Per question: ~$0.001-0.002
- 20 questions/day: ~$1-2/month
- 50 questions/day: ~$3-5/month
- 100 questions/day: ~$6-10/month

#### Step 4: Test It!

1. Click the green **HELP** button
2. Ask: "Explain quantum computing in simple terms"
3. You should get a detailed AI response!

---

### Option 3: Add Supabase for Data Storage (Optional)

**Why add Supabase?**
- Store conversation history permanently (not just in browser)
- Access conversations from any device
- Build custom knowledge bases
- Add user profiles, contacts, reminders

#### Step 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Sign up for free account
3. Click **"New Project"**
4. Fill in:
   - Name: `aworkingbear-assistant`
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

#### Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** (⚙️ icon in sidebar)
2. Click **"API"** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

#### Step 3: Add to Softgen Environment

1. In Softgen, go to **Settings** → **Environment** tab
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (your project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
3. Click **"Save"**
4. Click **"Restart Server"**

#### Step 4: Create Database Tables (I'll help with this)

Once you've added the credentials, let me know and I'll:
- Create the conversation history table
- Set up proper security rules
- Add data syncing between browser and database

---

## Browser Requirements

- ✅ **Chrome** or **Edge** (best voice recognition support)
- ⚠️ **Safari** works but voice recognition may be less accurate
- ⚠️ **Firefox** has limited voice support

## Usage Tips

- Speak clearly and wait for the "Listening..." indicator
- The button turns red while listening
- Answers are automatically read aloud
- You can replay any answer by clicking "Repeat Answer"
- Recent conversations are saved in your browser

## What Can You Ask?

### Built-in Knowledge (FREE)
- "What time is it?"
- "What day is today?"
- "Tell me about Shabbat"
- "When is Passover?"
- "Hello, how are you?"

### With OpenAI (Enhanced)
- Complex explanations
- Creative writing
- Detailed analysis
- Step-by-step instructions
- Anything you can imagine!

## Troubleshooting

### "I need an OpenAI API key..."
This is just a suggestion - the system works without it! But if you want to add it:
- Follow **Option 2** instructions above
- Make sure to restart the server after adding the key

### Voice not working
- Use Chrome or Edge browser
- Check microphone permissions in browser settings
- Speak clearly after "Listening..." appears
- Try refreshing the page

### Preview not loading
- Click "Restart Server" in Settings (⚙️)
- Refresh the preview window
- Check browser console for errors

### API Key Issues
- Make sure key starts with `sk-`
- No extra spaces when pasting
- Check you've added billing in OpenAI dashboard
- Restart server after adding key

## Future Enhancements (Coming Soon)

Phase 2:
- 📞 Contact storage (addresses, phone numbers)
- 🔍 Search your saved contacts
- 👥 Quick dial family members
- 📅 Reminders and calendar integration
- 🗂️ Custom knowledge bases

Phase 3:
- 🎤 Wake word detection ("Hey Assistant")
- 📹 Video call integration
- 💊 Medication reminders
- 🚨 Emergency contact system

## Support

Need help? 
- Report issues in Softgen chat
- Check documentation at softgen.ai
- Contact Softgen Support

---

**Built with ❤️ for aworkingbear**