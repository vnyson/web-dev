# Profile Image Fuzzy Matching & Shareable Link Fix

This plan implements dynamic profile image selection based on player name fuzzy matching and fixes the production shareable link domain.

## Profile Image Fuzzy Matching

**File:** `sites/tennis-stringing/js/main.js`

1. Create a constant array of available profile image filenames (excluding generic.png)
2. Implement `getProfileImageForPlayer(playerName)` function that:
   - Normalizes the player name (trim, lowercase, remove extra spaces)
   - Compares against available image filenames (normalized, without .png extension)
   - Returns the matching image path if found, otherwise returns generic.png
3. Update `renderProfileData()` function (line 499) to use the new fuzzy matching function instead of hardcoding `GENERIC_PROFILE_IMAGE`

## Shareable Link Domain Fix

**File:** `workers/api/src/index.ts`

1. Update line 458 to change production domain from `https://tennis-stringing.pages.dev` to `https://tennis.vnyson.com`
2. Keep local development as `http://localhost:8080`

## Implementation Notes

- Profile image matching will be case-insensitive and require very close match (normalized exact match)
- No API changes needed - profile image selection is purely client-side
- Shareable link fix is a single line change in the API worker
