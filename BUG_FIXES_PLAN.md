# Bug Fixes Plan - Priority Order

## Critical Bugs (Fix First)

### 1. ✅ White Text on White Background
**Status:** Fixed in globals.css
- Added explicit text colors for select elements
- Override dark mode for selects

### 2. Profile Interface Language Update Failure
**Issue:** Field update not working
**Fix:** Check API mapping and value passing

### 3. Dark Mode Not Working
**Issue:** Theme setting doesn't apply
**Fix:** Implement theme provider and apply classes

## High Priority (UX Issues)

### 4. Animation Jumping
**Issue:** Circle jumps during lookup
**Fix:** Smooth loading animation like LLM chat

### 5. Lookup Speed
**Issue:** Very slow
**Fix:** Optimize API calls, add caching

### 6. Study Mode Buttons
**Issue:** Too far from card, no keyboard shortcuts
**Fix:** Move buttons closer, add keyboard support

## Medium Priority (Features)

### 7. Batch Word Upload
**Issue:** Need Excel template or form
**Fix:** Add batch upload UI with template

### 8. Tag Filtering
**Issue:** Tags should be on top, need system tags
**Fix:** Add filter UI with system tags (3, 7, 30 days)

### 9. Welcome/Help Page
**Issue:** Need onboarding for first-time users
**Fix:** Create welcome page with native language support

---

## Fix Order

1. ✅ White text fix (DONE)
2. Profile Interface Language
3. Dark mode
4. Animation optimization
5. Study mode improvements
6. Lookup speed
7. Batch upload
8. Tag filtering
9. Welcome page

