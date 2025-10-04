# 🔒 API Key Security Checklist

## ✅ Completed Security Steps

### 1. Environment Variables Setup
- ✅ Created `.env` file with API key
- ✅ Created `.env.example` template (without real key)
- ✅ Added `.env` to `.gitignore`
- ✅ Updated `VoiceChat.tsx` to use `import.meta.env.VITE_GEMINI_API_KEY`
- ✅ Updated `geminiService.ts` to use `import.meta.env.VITE_GEMINI_API_KEY`
- ✅ Added TypeScript declarations in `vite-env.d.ts`
- ✅ Added error handling for missing API key

### 2. What Changed

**Before:**
```typescript
const API_KEY = 'AIzaSyC58XRYQOaauagMdXW5jcgN4CL7i5wGOgc'; // ❌ Hardcoded
```

**After:**
```typescript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // ✅ From .env
```

### 3. Files Created/Modified

**Created:**
- `.env` - Your private API key (not committed to git)
- `.env.example` - Template for other developers
- `.gitignore` - Excludes .env from version control
- `src/vite-env.d.ts` - TypeScript support for env variables

**Modified:**
- `src/components/VoiceChat.tsx` - Uses env variable
- `src/services/geminiService.ts` - Uses env variable
- `README.md` - Setup instructions added

---

## 🚨 Important Security Rules

### DO ✅
- Keep `.env` file private and local only
- Share `.env.example` (without real keys) with team
- Use different API keys for development/production
- Rotate API keys regularly
- Add `.env` to `.gitignore`
- Set usage quotas in Google AI Studio

### DON'T ❌
- Never commit `.env` files to git
- Never share API keys in chat/email
- Never hardcode API keys in source code
- Never expose API keys in client-side JavaScript (already done safely with Vite)
- Never use production keys for development

---

## 🔍 How to Check if Your Key is Safe

### 1. Check Git Status
```bash
git status
```
✅ `.env` should NOT appear in untracked files (it should be ignored)

### 2. Search Codebase for Hardcoded Keys
```bash
# Search for "AIza" pattern (Gemini API keys start with this)
grep -r "AIza" src/
```
✅ Should only find references to `import.meta.env.VITE_GEMINI_API_KEY`

### 3. Check GitHub (if already pushed)
If you accidentally committed the API key before:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Delete the compromised key
3. Create a new key
4. Update your `.env` file
5. Clean git history (or just delete and recreate the repo)

---

## 🛡️ Additional Security Recommendations

### 1. Set API Quotas
Protect against abuse if key is leaked:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Quotas
3. Set daily/monthly limits for Gemini API

### 2. Use API Key Restrictions (Advanced)
For production deployments:
- Restrict by IP address
- Restrict by HTTP referrer
- Use separate keys per environment

### 3. Monitor Usage
- Check [Google AI Studio](https://aistudio.google.com/app/apikey) regularly
- Review API usage patterns
- Set up alerts for unusual activity

### 4. Rotate Keys Regularly
Best practice: rotate API keys every 90 days
```bash
# Steps:
# 1. Create new key in AI Studio
# 2. Update .env with new key
# 3. Restart dev server
# 4. Test that everything works
# 5. Delete old key from AI Studio
```

---

## 📋 Team Setup Instructions

When sharing this project with teammates:

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd galileo-lenses
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   copy .env.example .env
   ```

4. **Get API key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create personal API key
   - Add to `.env` file

5. **Start development**
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployment

For deploying to production (Vercel, Netlify, etc.):

### Vercel
1. Go to project settings
2. Navigate to Environment Variables
3. Add: `VITE_GEMINI_API_KEY` = `your_production_key`
4. Redeploy

### Netlify
1. Site settings → Environment variables
2. Add: `VITE_GEMINI_API_KEY` = `your_production_key`
3. Trigger new deploy

### Other Platforms
- Most support environment variables in dashboard
- Never commit production keys to `.env`
- Use platform's secret management features

---

## ✅ Verification Checklist

Before committing code, verify:

- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded API keys in source files
- [ ] `.env.example` exists (without real keys)
- [ ] README.md has setup instructions
- [ ] All API calls use `import.meta.env.VITE_GEMINI_API_KEY`
- [ ] Error handling for missing API key exists
- [ ] Dev server restarts after `.env` changes

---

## 🆘 What if I Leaked My API Key?

**Immediate Actions:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Delete the compromised key immediately
3. Create a new key
4. Update your `.env` file
5. If committed to GitHub:
   - Option A: Delete and recreate repo (simplest)
   - Option B: Use `git filter-branch` to clean history (advanced)

**Prevention:**
- Use a pre-commit hook to prevent committing `.env`
- Consider tools like `git-secrets` or `trufflehog`

---

## 📞 Support

If you have questions about API key security:
- Check [Google AI Security Best Practices](https://ai.google.dev/docs/security)
- Review [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- See IMPROVEMENTS.md for additional security enhancements

**Your API key is now secure! 🎉**
