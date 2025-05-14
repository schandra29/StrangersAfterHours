# R-Rated Dares

This document explains how to create and import R-Rated dares for the Strangers: After Hours game.

## CSV Format

R-Rated dares are stored in a CSV file with an ID and the text of each dare:

```
Dare ID,Dare Text
1,"Whisper a secret to another person."
2,"Call people pet names and see how they react."
```

The import script will automatically:
- Set the type to "R-Rated Dare"
- Assign intensity levels based on ID ranges:
  - IDs 1-33: Intensity level 1 (mild)
  - IDs 34-66: Intensity level 2 (moderate)
  - IDs 67-100: Intensity level 3 (spicy)

## Adding Your Own R-Rated Dares

1. Edit the `r-rated-dares-template.csv` file
2. Add your dares following the format above
3. Save the file

## Importing R-Rated Dares

To import your R-Rated dares into the game:

```
node import-r-rated-dares.js
```

This will:
1. Read the CSV file
2. Parse the dares
3. Import them to the database

## Guidelines for Creating R-Rated Dares

When creating R-Rated dares, remember that they should:
- Be consensual
- Respect boundaries
- Not involve anything illegal or harmful
- Be fun rather than humiliating

## Example Dares

Here are some examples of R-Rated dares that you can use or modify:

- "Share an awkward dating story that you've never told anyone"
- "Describe your ideal romantic partner in detail"
- "Share your first kiss story with the group"
- "Show the most embarrassing photo on your phone"
- "Re-enact your best flirting technique"
- "Share your most embarrassing romantic rejection story"
- "Send a flirty text to the last person you texted"
- "Show the group your dating app profile (if you have one)"
- "Share the most awkward physical interaction you've had with someone you were attracted to"