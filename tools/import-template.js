/**
 * This is a template file to help format prompts for bulk import.
 * You can copy this file, modify it with your prompts, and run it to generate JSON 
 * that can be imported via the API.
 * 
 * Usage:
 * 1. Copy this file to a new file (e.g., my-prompts.js)
 * 2. Add your prompts to the arrays for each level and intensity
 * 3. Run with Node.js (node my-prompts.js)
 * 4. It will generate a JSON file that can be used with the /api/import/prompts endpoint
 * 
 * Note: This file uses ES modules (import/export) as specified in package.json
 */

// Sample prompts structure (replace with your actual prompts)
const prompts = {
  // Level 1: Icebreakers
  level1: {
    // Intensity 1: Mild
    intensity1: [
      "If you could have dinner with any historical figure, who would it be and why?",
      "What's one skill you wish you had learned earlier in life?",
      // Add more level 1, intensity 1 prompts here (up to 100)
    ],
    
    // Intensity 2: Medium
    intensity2: [
      "What's a popular opinion you strongly disagree with?",
      "What's the best piece of advice you've ever received?",
      // Add more level 1, intensity 2 prompts here (up to 100)
    ],
    
    // Intensity 3: Wild
    intensity3: [
      "What's one thing that's on your bucket list that might surprise people?",
      "What's the most spontaneous thing you've ever done?",
      // Add more level 1, intensity 3 prompts here (up to 100)
    ]
  },
  
  // Level 2: Getting to Know You
  level2: {
    // Intensity 1: Mild
    intensity1: [
      "What's something you're proud of that you don't often get to talk about?",
      "What's a small, everyday thing that brings you joy?",
      // Add more level 2, intensity 1 prompts here (up to 100)
    ],
    
    // Intensity 2: Medium
    intensity2: [
      "What's a belief or value you hold that has changed significantly over time?",
      "What's something you've accomplished that you once thought was impossible?",
      // Add more level 2, intensity 2 prompts here (up to 100)
    ],
    
    // Intensity 3: Wild
    intensity3: [
      "What's something that deeply moved you or changed your perspective?",
      "What's a meaningful connection or relationship that shaped who you are today?",
      // Add more level 2, intensity 3 prompts here (up to 100)
    ]
  },
  
  // Level 3: Deeper Dive
  level3: {
    // Intensity 1: Mild
    intensity1: [
      "What values or principles do you try to live by?",
      "What's something you're still figuring out in life?",
      // Add more level 3, intensity 1 prompts here (up to 100)
    ],
    
    // Intensity 2: Medium
    intensity2: [
      "What's something you're passionate about that you wish more people understood?",
      "In what ways are you different from the person you were five years ago?",
      // Add more level 3, intensity 2 prompts here (up to 100)
    ],
    
    // Intensity 3: Wild
    intensity3: [
      "What's a moment in your life where you felt truly vulnerable?",
      "What's something you're still healing from or working through?",
      // Add more level 3, intensity 3 prompts here (up to 100)
    ]
  }
};

// Convert the prompts to the format needed for the import API
function formatPromptsForImport() {
  const formatted = { prompts: [] };
  
  // Level mappings
  const levelNames = {
    level1: "Icebreaker",
    level2: "Getting to Know You",
    level3: "Deeper Dive"
  };
  
  // Process each level and intensity
  for (const [levelKey, intensities] of Object.entries(prompts)) {
    const levelNum = parseInt(levelKey.replace('level', ''));
    const categoryName = levelNames[levelKey];
    
    for (const [intensityKey, promptTexts] of Object.entries(intensities)) {
      const intensityNum = parseInt(intensityKey.replace('intensity', ''));
      
      for (const text of promptTexts) {
        formatted.prompts.push({
          text,
          level: levelNum,
          intensity: intensityNum,
          category: categoryName,
          isCustom: false,
          userId: null
        });
      }
    }
  }
  
  return formatted;
}

// Save the formatted prompts to a JSON file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formattedPrompts = formatPromptsForImport();
const outputPath = path.join(__dirname, 'prompts-import.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedPrompts, null, 2));

console.log(`Generated ${formattedPrompts.prompts.length} prompts for import.`);
console.log(`Saved to ${outputPath}`);
console.log('');
console.log('To import these prompts, you can use the API:');
console.log('curl -X POST -H "Content-Type: application/json" -d @prompts-import.json http://localhost:5000/api/import/prompts');