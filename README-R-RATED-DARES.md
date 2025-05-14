# R-Rated Dares

This document explains how to create and import R-Rated dares for the Strangers: After Hours game.

## CSV Format

R-Rated dares are stored in a CSV file with the following columns:

```
type,intensity,text
R-Rated Dare,1,"Share an awkward dating story that you've never told anyone"
```

- **type**: Always "R-Rated Dare"
- **intensity**: 1 (mild), 2 (moderate), or 3 (spicy)
- **text**: The text of the dare/challenge

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

When creating R-Rated dares, consider:

- **Level 1 (Mild)**: Slightly flirtatious or mildly embarrassing dares
- **Level 2 (Moderate)**: More personal questions or somewhat embarrassing dares
- **Level 3 (Spicy)**: Dares that push comfort zones but remain respectful

Remember that all R-Rated dares should:
- Be consensual
- Respect boundaries
- Not involve anything illegal or harmful
- Be fun rather than humiliating

## Examples by Intensity

### Level 1 (Mild)
- "Share an awkward dating story that you've never told anyone"
- "Describe your ideal romantic partner in detail"
- "Share your first kiss story with the group"

### Level 2 (Moderate)
- "Show the most embarrassing photo on your phone"
- "Re-enact your best flirting technique"
- "Share your most embarrassing romantic rejection story"

### Level 3 (Spicy)
- "Send a flirty text to the last person you texted"
- "Show the group your dating app profile (if you have one)"
- "Share the most awkward physical interaction you've had with someone you were attracted to"