# Adding Dares to the Game

This document provides instructions on how to add new dares to the "Strangers: After Hours" party game.

## Method 1: Using the In-Game Interface

1. Start the game
2. Click on the "Menu" button in the top-right corner
3. Select "Add Custom Challenge"
4. Choose "Dare" as the challenge type
5. Select the intensity level (1-3)
6. Enter your dare in the text field
7. Click "Save Challenge"

## Method 2: Using the Bulk Import Tool

For adding multiple dares at once, you can use the CSV import utility:

1. Open the `dares-template.csv` file in a text editor or spreadsheet program
2. Add your dares to the file, one per line
   - Simply write the text of the dare (e.g., "Do your best impression of a celebrity")
   - The system will randomly assign an intensity level (1-3) to each dare
3. Add as many dares as you want, each on a new line
4. Save the file
5. Run the import script: `node import-dares.js`

### Intensity Levels

- **Level 1 (Mild)**: Light, fun dares suitable for most groups
- **Level 2 (Medium)**: Moderately challenging dares that require a bit more courage
- **Level 3 (Wild)**: More adventurous dares for groups comfortable with higher intensity

### Example Dares by Intensity

**Level 1 (Mild):**
- Do your best impression of a celebrity for 30 seconds
- Take a selfie with a silly face and share it with the group
- Stand up and do 10 jumping jacks

**Level 2 (Medium):**
- Send a text to a friend with a compliment
- Do your best dance move
- Make up a 30-second commercial for a random object in the room

**Level 3 (Wild):**
- Post a status update written by the group
- Let someone look through your phone's photo gallery for 30 seconds
- Tell an embarrassing story about yourself