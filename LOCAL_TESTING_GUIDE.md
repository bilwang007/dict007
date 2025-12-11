# Local Testing Guide

## 🚀 Server Status

The development server should be starting. Check:
- **URL:** http://localhost:3000
- **Status:** Starting...

---

## 📋 Testing Checklist

### 1. Critical Bugs Testing

#### ✅ Bug #10: Profile Interface Language
**Steps:**
1. Navigate to Profile page (`/profile`)
2. Click edit on "Interface Language" field
3. Change language (e.g., English → Chinese)
4. Click Save
5. **Expected:** Page reloads and all UI text changes to new language

**Test Cases:**
- [ ] Change from English to Chinese
- [ ] Change from Chinese to English
- [ ] Verify all navigation labels change
- [ ] Verify all page text changes
- [ ] Verify language persists after page reload

---

#### ✅ Bug #11: Dark Mode Theme
**Steps:**
1. Navigate to Profile page (`/profile`)
2. Click edit on "Theme" field
3. Select "Dark" mode
4. Click Save
5. **Expected:** Page immediately switches to dark mode

**Test Cases:**
- [ ] Select "Dark" mode
- [ ] Verify background becomes dark
- [ ] Verify text becomes light
- [ ] Select "Light" mode
- [ ] Verify theme switches back
- [ ] Select "Auto" mode
- [ ] Verify theme follows system preference
- [ ] Verify theme persists after page reload

---

#### ✅ Bug #2: Checkbox Styling
**Steps:**
1. Navigate to Notebook page (`/notebook`)
2. Look for checkboxes next to words
3. **Expected:** Checkboxes should be styled with blue background when checked

**Test Cases:**
- [ ] Verify checkboxes in notebook page
- [ ] Click checkbox - should show blue background
- [ ] Verify white checkmark appears
- [ ] Test hover effect
- [ ] Test in quiz page selection
- [ ] Test dark mode checkbox styling

---

### 2. New Features Testing

#### ✅ Feature #1: Step-by-Step Meanings
**Steps:**
1. Navigate to home page (`/`)
2. Search for a word with multiple meanings (e.g., "bank")
3. **Expected:** Meanings appear one by one with smooth animation

**Test Cases:**
- [ ] Search "bank" (has multiple meanings)
- [ ] Verify meanings appear sequentially
- [ ] Verify smooth fade-in animation
- [ ] Verify loading indicator shows
- [ ] Test with single meaning word
- [ ] Test with Wikipedia source
- [ ] Test with LLM source

---

#### ✅ Feature #3: Tagging Buttons
**Steps:**
1. Navigate to Notebook page (`/notebook`)
2. Find a word entry
3. Click the Tag icon in the header
4. **Expected:** Tag input appears, can add/remove tags

**Test Cases:**
- [ ] Click tag button in notebook item header
- [ ] Add a tag
- [ ] Verify tag appears as badge
- [ ] Remove a tag
- [ ] Navigate to Study mode (`/study`)
- [ ] Flip a flashcard
- [ ] Click tag button on back of card
- [ ] Add tag to flashcard
- [ ] Verify tags persist after page reload

---

#### ✅ Feature #4: Quiz Module
**Steps:**
1. Navigate to Quiz page (`/quiz`)
2. Select words from notebook
3. Click "Start Quiz"
4. **Expected:** Fill-in-the-blank questions appear

**Test Cases:**
- [ ] Navigate to Quiz page
- [ ] Select multiple words
- [ ] Click "Start Quiz"
- [ ] Answer a question correctly
- [ ] Answer a question incorrectly
- [ ] Verify score updates
- [ ] Complete quiz
- [ ] Verify results summary
- [ ] Test "Try Again" button
- [ ] Test navigation back to notebook

---

#### ✅ Feature #6: Form Upload
**Steps:**
1. Navigate to Notebook page (`/notebook`)
2. Scroll to bottom
3. Click "Form Upload" button
4. Enter words (one per line)
5. Click "Upload Words"
6. **Expected:** Words are looked up and added to notebook

**Test Cases:**
- [ ] Open form upload modal
- [ ] Enter words separated by newlines
- [ ] Enter words separated by commas
- [ ] Verify word count updates
- [ ] Select languages
- [ ] Click "Upload Words"
- [ ] Verify progress indicator
- [ ] Verify words appear in notebook
- [ ] Test error handling (invalid words)

---

#### ✅ Feature #7: Previous/Next on First Screen
**Steps:**
1. Navigate to Study mode (`/study`)
2. Look at flashcard front
3. **Expected:** Previous/Next buttons visible at bottom

**Test Cases:**
- [ ] Navigate to Study mode
- [ ] Verify buttons appear on front of card
- [ ] Click "Previous" button
- [ ] Verify card changes
- [ ] Click "Next" button
- [ ] Verify card changes
- [ ] Verify buttons don't flip card
- [ ] Test keyboard shortcuts still work

---

#### ✅ Feature #8: Swipe Gestures
**Steps:**
1. Navigate to Study mode (`/study`)
2. On mobile device (or browser mobile emulation)
3. Swipe left on flashcard
4. **Expected:** Card advances to next

**Test Cases:**
- [ ] Test on mobile device
- [ ] Swipe left - should go to next card
- [ ] Swipe right - should go to previous card
- [ ] Verify minimum swipe distance (50px)
- [ ] Test with buttons (should not trigger)
- [ ] Test with inputs (should not trigger)

---

#### ✅ Feature #9: Welcome Page Images
**Steps:**
1. Navigate to Welcome page (`/welcome`)
2. Navigate through steps
3. **Expected:** Visual guides appear for each step

**Test Cases:**
- [ ] Navigate to Welcome page
- [ ] Verify Step 1 shows search bar illustration
- [ ] Click Next
- [ ] Verify Step 2 shows save button illustration
- [ ] Continue through all steps
- [ ] Verify all visual guides appear
- [ ] Test responsive design
- [ ] Test on mobile device

---

### 3. Mobile Responsiveness Testing

**Steps:**
1. Open browser DevTools
2. Enable mobile device emulation
3. Test all pages
4. **Expected:** All pages adapt properly to mobile screens

**Test Cases:**
- [ ] Test home page on mobile
- [ ] Test notebook page on mobile
- [ ] Test study mode on mobile
- [ ] Test quiz page on mobile
- [ ] Test profile page on mobile
- [ ] Test welcome page on mobile
- [ ] Verify text is readable
- [ ] Verify buttons are tappable
- [ ] Verify modals work on mobile
- [ ] Verify forms work on mobile
- [ ] Test landscape orientation

---

## 🐛 Common Issues & Solutions

### Issue: Server not starting
**Solution:** 
- Check if port 3000 is already in use
- Kill existing process: `lsof -ti:3000 | xargs kill`
- Restart: `npm run dev`

### Issue: Dark mode not working
**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify theme is saved in profile
- Check `app/lib/theme-provider.tsx` is loaded

### Issue: Swipe gestures not working
**Solution:**
- Test on actual mobile device (not just emulation)
- Verify touch events are enabled
- Check browser console for errors

### Issue: Quiz not generating questions
**Solution:**
- Ensure words have example sentences
- Check browser console for errors
- Verify words are selected

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

### Critical Bugs
- [ ] Profile Interface Language: PASS / FAIL
- [ ] Dark Mode Theme: PASS / FAIL
- [ ] Checkbox Styling: PASS / FAIL

### New Features
- [ ] Step-by-Step Meanings: PASS / FAIL
- [ ] Tagging Buttons: PASS / FAIL
- [ ] Quiz Module: PASS / FAIL
- [ ] Form Upload: PASS / FAIL
- [ ] Previous/Next on Front: PASS / FAIL
- [ ] Swipe Gestures: PASS / FAIL
- [ ] Welcome Page Images: PASS / FAIL

### Mobile
- [ ] Responsive Design: PASS / FAIL

### Notes:
_______________________________________
_______________________________________
```

---

## ✅ Ready for Testing!

The development server should be running at:
**http://localhost:3000**

Start testing and report any issues!
