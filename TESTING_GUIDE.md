# Testing Guide - User Portal Enhancements

## Quick Start

### Prerequisites
1. MongoDB running
2. Backend server running on port 5000
3. Frontend dev server running

### Start the Application
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

## Test Scenarios

### 1. Goal Selection Flow

#### Test 1.1: View All Goals
1. Login as a user
2. Navigate to `/goal-selection`
3. **Expected**: All admin-added goals displayed in grid
4. **Verify**: Each goal shows icon, title, description, difficulty, and estimated time

#### Test 1.2: Select Goal
1. Click on any goal card
2. **Expected**: Goal card highlights with blue border
3. **Expected**: "Step 2: What's Your Current Skill Level?" section appears below

#### Test 1.3: Skill Level Validation (Meeting Requirements)
1. Select a "Beginner" goal
2. Select "Intermediate" or "Advanced" skill level
3. **Expected**: Green success message appears
4. **Message**: "Your skill level meets the requirements for this goal"

#### Test 1.4: Skill Level Validation (Below Requirements)
1. Select an "Advanced" goal
2. Select "Beginner" skill level
3. **Expected**: Amber warning message appears
4. **Message**: "Your current skill level is below the recommended level for this goal. Proceeding may require additional effort."

#### Test 1.5: Generate Roadmap Preview
1. Select a goal and skill level
2. Click "See Roadmap" button
3. **Expected**: 
   - Button shows loading state: "Generating Roadmap..."
   - Modal appears after loading
   - Modal shows:
     - Roadmap title
     - Description
     - Difficulty, Duration, Total Steps stats
     - Progress bar at 0%
     - All learning steps listed

### 2. Roadmap Modal

#### Test 2.1: Modal Display
1. After generating roadmap preview
2. **Verify Modal Contains**:
   - Header with title and close button
   - Three stat cards (Difficulty, Duration, Steps)
   - Progress bar showing 0%
   - All steps with:
     - Step number
     - Title
     - Description
     - Skills list
     - Duration
   - Footer with Cancel and Start Learning buttons

#### Test 2.2: Close Modal
1. Click the "X" button in modal header
2. **Expected**: Modal closes, returns to goal selection
3. Click "See Roadmap" again
4. **Expected**: Can regenerate preview

#### Test 2.3: Cancel Button
1. In modal, click "Cancel" button
2. **Expected**: Same as closing modal

### 3. Start Learning Flow

#### Test 3.1: Save Roadmap
1. In modal, click "Start Learning"
2. **Expected**:
   - Button shows loading: "Saving..."
   - After save, redirects to dashboard
   - Dashboard shows new roadmap in "Active Roadmaps"

#### Test 3.2: Duplicate Roadmap Check
1. Try to create a roadmap for the same goal again
2. **Expected**: Error message: "You already have a roadmap for this goal. Please complete or delete the existing one first."

### 4. Roadmap View - All Steps Display

#### Test 4.1: View My Roadmaps
1. Navigate to `/user/roadmaps`
2. **Expected**:
   - Left sidebar shows all user's roadmaps
   - Each roadmap card shows:
     - Title
     - Difficulty badge
     - Goal name
     - Progress bar with percentage
     - Time spent
     - Start date

#### Test 4.2: Select Roadmap
1. Click on a roadmap in the list
2. **Expected**:
   - Card highlights with blue ring
   - Right panel shows full roadmap details
   - All steps displayed at once (not just first step)

#### Test 4.3: Step Details
1. View selected roadmap
2. **Verify Each Step Shows**:
   - Step number badge
   - Title
   - Description
   - Skills list
   - Duration
   - "Mark Complete" button

### 5. Step Completion

#### Test 5.1: Mark Step as Complete
1. Click "Mark Complete" on any step
2. **Expected**:
   - Button shows "Updating..." with spinner
   - After update:
     - Step background turns green
     - Checkmark icon appears
     - Button changes to "Completed" (disabled)
     - Progress bar updates
     - "Complete" stat updates
     - Progress percentage recalculates

#### Test 5.2: Completed Step State
1. Try to click a completed step button
2. **Expected**: Button is disabled, cannot click
3. **Verify**:
   - Green background
   - Checkmark visible
   - Button shows "Completed"

#### Test 5.3: Progress Calculation
1. Complete multiple steps
2. **Verify**:
   - Progress percentage = (completed / total) × 100
   - Progress bar width matches percentage
   - Stats update:
     - "X% Complete"
     - "Y Steps Done"
     - Total steps unchanged

### 6. Progress Persistence

#### Test 6.1: Refresh Page
1. Mark some steps as complete
2. Refresh the page
3. **Expected**: All completion states persist

#### Test 6.2: Navigate Away and Back
1. Complete steps on a roadmap
2. Navigate to dashboard
3. Navigate back to `/user/roadmaps`
4. **Expected**: Progress still shows correctly

#### Test 6.3: Cross-Session Persistence
1. Complete steps
2. Logout
3. Login again
4. **Expected**: All progress still there

### 7. Reset Progress

#### Test 7.1: Reset Functionality
1. Complete some steps on a roadmap
2. Click "Reset Progress" button
3. **Expected**: Confirmation dialog appears
4. Click "Cancel" in confirmation
5. **Expected**: No changes
6. Click "Reset Progress" again
7. Click "OK" in confirmation
8. **Expected**:
   - All steps return to incomplete
   - Progress bar returns to 0%
   - All stats reset

### 8. Error Handling

#### Test 8.1: Network Error Handling
1. Disconnect from internet
2. Try to generate roadmap
3. **Expected**: Error message displays
4. Reconnect
5. Try again
6. **Expected**: Works normally

#### Test 8.2: API Error Display
1. Stop backend server
2. Try to load goals
3. **Expected**: 
   - Error banner appears
   - Fallback sample data may display
4. Start backend
5. Refresh page
6. **Expected**: Real data loads

#### Test 8.3: Validation Errors
1. Try to create roadmap without selecting goal
2. **Expected**: Button is disabled
3. Select goal but not skill level
4. **Expected**: Button still disabled

### 9. Loading States

#### Test 9.1: Goals Loading
1. Fresh page load of goal selection
2. **Expected**: 
   - Spinner shows
   - Message: "Loading career goals..."
   - Data loads and replaces spinner

#### Test 9.2: Roadmap Generation Loading
1. Click "See Roadmap"
2. **Expected**:
   - Button disabled during loading
   - Text changes to "Generating Roadmap..."
   - Spinner visible

#### Test 9.3: Save Loading
1. Click "Start Learning"
2. **Expected**:
   - Button shows "Saving..."
   - Spinner visible
   - Button disabled

#### Test 9.4: Step Update Loading
1. Click "Mark Complete"
2. **Expected**:
   - Button shows "Updating..."
   - Spinner visible
   - Cannot click again during update

### 10. Responsive Design

#### Test 10.1: Mobile View
1. Resize browser to mobile width (< 768px)
2. **Verify**:
   - Goals display in single column
   - Modal is scrollable
   - Buttons are touch-friendly
   - Text is readable

#### Test 10.2: Tablet View
1. Resize to tablet width (768px - 1024px)
2. **Verify**:
   - Goals in 2 columns
   - Roadmap list and details stack vertically
   - Layout looks good

#### Test 10.3: Desktop View
1. Full desktop width (> 1024px)
2. **Verify**:
   - Goals in 3 columns
   - Roadmap list and details side-by-side
   - Proper spacing and margins

### 11. Visual Feedback

#### Test 11.1: Hover States
1. Hover over goal cards
2. **Expected**: Shadow increases, border color changes
3. Hover over buttons
4. **Expected**: Background color darkens slightly

#### Test 11.2: Active States
1. Click and hold on interactive elements
2. **Expected**: Visual feedback during click

#### Test 11.3: Transitions
1. Observe all state changes
2. **Expected**: Smooth 0.3s transitions
3. Progress bar updates smoothly

### 12. Dashboard Integration

#### Test 12.1: Active Roadmaps Display
1. Create a roadmap
2. Navigate to dashboard
3. **Expected**: Roadmap appears in "Active Roadmaps" section

#### Test 12.2: Progress on Dashboard
1. Complete some steps in roadmap
2. Check dashboard
3. **Expected**: 
   - Progress percentage shows correctly
   - Stats update (time spent, etc.)

## Common Issues & Solutions

### Issue: Goals not loading
**Solution**: 
1. Check backend is running
2. Verify MongoDB connection
3. Ensure admin has created goals

### Issue: Roadmap not saving
**Solution**:
1. Check authentication token is valid
2. Verify no duplicate roadmap exists
3. Check backend logs for errors

### Issue: Progress not persisting
**Solution**:
1. Clear browser cache
2. Check UserProgress model in database
3. Verify API endpoints are working

### Issue: Modal not displaying
**Solution**:
1. Check browser console for errors
2. Verify roadmap generation API works
3. Check z-index in CSS

## Performance Checklist

- [ ] Goals load in < 2 seconds
- [ ] Roadmap generation < 2 seconds
- [ ] Step completion updates < 1 second
- [ ] Page transitions are smooth
- [ ] No console errors
- [ ] No memory leaks (check dev tools)

## Accessibility Checklist

- [ ] All buttons have clear labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Screen reader friendly (test with NVDA/JAWS)

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Loading states work properly
✅ Error messages are clear
✅ Progress persists correctly
✅ Responsive on all devices
✅ Smooth animations
✅ Accessible interface

## Reporting Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check network tab for failed requests
4. Document expected vs actual behavior
5. Include screenshots if helpful

## Additional Notes

- Test with different user accounts
- Test with various goals and skill levels
- Test with slow network (throttle in dev tools)
- Test with different screen sizes
- Verify all edge cases

