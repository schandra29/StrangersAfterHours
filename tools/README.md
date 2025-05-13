# Import Tools for Strangers: After Hours

This directory contains tools to help you import your prompts and challenges into the game.

## Template Files

1. `900-prompts-template.csv` - A CSV template you can fill with your 900 prompts
2. `sample-prompts.csv` - A small sample of prompts already imported
3. `challenges-template.csv` - A template for challenges (Truth or Dare, Act It Out)

## Import Process

### Step 1: Prepare Your CSV File

Fill in the `900-prompts-template.csv` with your prompts, following this format:
```
level,intensity,text,category
1,1,"Your prompt text here","Icebreaker"
```

- **level**: 1-3 (1 = Icebreaker, 2 = Getting to Know You, 3 = Deeper Dive)
- **intensity**: 1-3 (1 = Mild, 2 = Medium, 3 = Wild)
- **text**: The actual prompt text, enclosed in double quotes
- **category**: The category name, typically matches the level name

### Step 2: Run the Import Tool

Once your CSV files are ready, use the appropriate import tool:

For prompts:
```
node direct-import.js your-prompts.csv
```

For challenges:
```
node import-challenges.js your-challenges.csv
```

These tools will:
1. Parse your CSV file
2. Import the data to the database in batches
3. Show you progress as it imports

### Tips for Large Imports

For your 900 prompts, consider these tips:
- Split them into multiple CSV files if needed (e.g., 300 prompts per file)
- The import tool automatically processes in small batches to avoid overwhelming the server
- Allow sufficient time for the import to complete

## Verification

After importing, you can verify the prompts are in the database:
1. Go to the app and start a game
2. Check if the prompts appear when you select different levels and intensities
3. You can also check the `/api/prompts` endpoint directly

For any issues, check the server logs for error messages.