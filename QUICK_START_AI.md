# Quick Start Guide - AI Roadmap Generation

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd server
npm install
# Dependencies (openai, @google/generative-ai) are already installed
```

### Step 2: Get API Keys

You need **at least ONE** of these:

#### Google Gemini - Free Tier
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API key"
4. Copy the key

### Step 3: Configure Environment

Create `.env` file in `server/` directory:

```bash
cd server
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API key:

```env
# Add your Gemini API key:
GEMINI_API_KEY=your-gemini-key-here

# Optional: Choose AI strategy
AI_STRATEGY=gemini

# Other required vars (should already be set):
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/nexstepai
```

### Step 4: Start the Application

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 5: Test It Out!

1. **Login** to your account at http://localhost:5173
2. **Navigate** to "AI Roadmap" in the navigation bar
3. **Enter** your learning goal (e.g., "I want to become a data scientist")
4. **Click** "Enhance Goal with AI"
5. **Review** the AI-enhanced goal
6. **Generate** your personalized roadmap
7. **Save** it to your profile!

---

## 📋 Quick Test Scenarios

### Test 1: Generate Your First Roadmap
```
Input: "I want to learn machine learning"
Expected: 
- Goal categorized as "Machine Learning"
- Difficulty set appropriately
- 6-10 learning steps generated
- Skills and timeline included
```

### Test 2: Use Existing Goal
```
1. Click "Use Existing Goal" tab
2. Select a goal from dropdown
3. Click "Generate Roadmap"
4. Preview and save
```

### Test 3: Admin Moderation
```
1. Login as admin
2. Go to "Manage Goals" or "Manage Roadmaps"
3. Filter by "User Submitted" or "AI Generated"
4. Review AI-generated content
```

---

## 🎯 Key Features to Try

### For Users:
- ✨ **AI Goal Enhancement** - Describe goals in plain English
- 🗺️ **Smart Roadmap Generation** - Get personalized learning paths
- 📊 **Progress Tracking** - View your roadmaps in dashboard
- 🔄 **AI Powered** - Powered by Google Gemini

### For Admins:
- 🔍 **Content Filtering** - Filter by AI-generated vs manual
- ✅ **Moderation Tools** - Approve/reject/flag content
- 📈 **Usage Analytics** - Track AI generation statistics
- 🎨 **Visual Indicators** - See AI source and moderation status

---

## ⚙️ Configuration Options

### Change AI Service Priority

In `.env`:
```env
AI_STRATEGY=gemini    # Always use Gemini
```

### Adjust Rate Limits

In `.env`:
```env
# Allow 20 roadmaps per hour per user
AI_MAX_REQUESTS_PER_USER=20

# 2-hour window (in milliseconds)
AI_RATE_LIMIT_WINDOW=7200000
```

### Change AI Models

In `.env`:
```env
# Use Gemini Pro
GEMINI_MODEL=gemini-1.5-pro
```

---

## 🔧 Troubleshooting

### Issue: "AI service not configured"
**Solution**: 
```bash
# Make sure you have your Gemini API key in .env
echo $GEMINI_API_KEY    # Should not be empty

# Restart server after adding keys
```

### Issue: "Rate limit exceeded"
**Solution**:
```
Wait 1 hour or increase limit in .env:
AI_MAX_REQUESTS_PER_USER=20
```

### Issue: Slow generation
**Solution**:
```env
# Use Gemini for faster generation
AI_STRATEGY=gemini
```

---

## 📱 Access Points

After starting the application:

| Feature | URL | Role Required |
|---------|-----|---------------|
| AI Roadmap Generator | http://localhost:5173/user/ai-roadmap | User |
| Manage AI Goals | http://localhost:5173/admin/goals | Admin |
| Manage AI Roadmaps | http://localhost:5173/admin/roadmaps | Admin |
| User Dashboard | http://localhost:5173/dashboard | User |

---

## 💡 Tips

1. **Be Specific**: The more detailed your goal description, the better the AI-generated roadmap
   - ❌ "learn programming"
   - ✅ "become a full-stack web developer specializing in React and Node.js"

2. **Use Context**: Fill in skill level and background for more personalized roadmaps

3. **Preview First**: Always review the AI-generated roadmap before saving

4. **Monitor Limits**: Check remaining credits at the top of the AI Roadmap page

5. **Try Both Services**: Test GPT and Gemini to see which works better for you

---

## 📚 Need More Help?

- **Comprehensive Guide**: See `AI_ROADMAP_GUIDE.md`
- **Implementation Details**: See `AI_IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: Check controller files for endpoint details

---

## 🎉 You're Ready!

That's it! You now have a fully functional AI-driven roadmap generation system.

**Next Steps:**
1. ✅ Add your API key(s)
2. ✅ Start the servers
3. ✅ Generate your first roadmap
4. ✅ Customize rate limits and settings as needed

**Happy Learning! 🚀**

