import { type Prompt, type Challenge } from "@shared/schema";

// Fallback prompts in case API fails
export const fallbackPrompts: Partial<Prompt>[] = [
  // Level 1: Icebreakers (Mild)
  {
    text: "If you could have dinner with any historical figure, who would it be and why?",
    level: 1,
    intensity: 1,
    category: "Icebreaker"
  },
  {
    text: "What's one skill you wish you had learned earlier in life?",
    level: 1,
    intensity: 1,
    category: "Icebreaker"
  },
  {
    text: "If you could travel anywhere in the world right now, where would you go and why?",
    level: 1,
    intensity: 1,
    category: "Icebreaker"
  },
  
  // Level 1: Icebreakers (Medium)
  {
    text: "What's a popular opinion you strongly disagree with?",
    level: 1,
    intensity: 2,
    category: "Icebreaker"
  },
  {
    text: "What's the best piece of advice you've ever received?",
    level: 1,
    intensity: 2,
    category: "Icebreaker"
  },
  
  // Level 1: Icebreakers (Wild)
  {
    text: "What's one thing that's on your bucket list that might surprise people?",
    level: 1,
    intensity: 3,
    category: "Icebreaker"
  },
  
  // Level 2: Getting to Know You (Mild)
  {
    text: "What's something you're proud of that you don't often get to talk about?",
    level: 2,
    intensity: 1,
    category: "Getting to Know You"
  },
  {
    text: "What's a small, everyday thing that brings you joy?",
    level: 2,
    intensity: 1,
    category: "Getting to Know You"
  },
  
  // Level 2: Getting to Know You (Medium)
  {
    text: "What's a belief or value you hold that has changed significantly over time?",
    level: 2,
    intensity: 2,
    category: "Getting to Know You"
  },
  
  // Level 2: Getting to Know You (Wild)
  {
    text: "What's something that deeply moved you or changed your perspective?",
    level: 2,
    intensity: 3,
    category: "Getting to Know You"
  },
  
  // Level 3: Deeper Dive (Mild)
  {
    text: "What values or principles do you try to live by?",
    level: 3,
    intensity: 1,
    category: "Deeper Dive"
  },
  
  // Level 3: Deeper Dive (Medium)
  {
    text: "What's something you're passionate about that you wish more people understood?",
    level: 3,
    intensity: 2,
    category: "Deeper Dive"
  },
  
  // Level 3: Deeper Dive (Wild)
  {
    text: "What's a moment in your life where you felt truly vulnerable?",
    level: 3,
    intensity: 3,
    category: "Deeper Dive"
  }
];

// Fallback challenges in case API fails
export const fallbackChallenges: Partial<Challenge>[] = [
  // Truth or Dare (Mild)
  {
    type: "Truth or Dare",
    text: "TRUTH: Share a funny childhood memory OR DARE: Do your best impression of someone in the group",
    intensity: 1
  },
  
  // Truth or Dare (Medium)
  {
    type: "Truth or Dare",
    text: "TRUTH: What's the most embarrassing thing you've done in public? OR DARE: Let someone post anything they want to your social media",
    intensity: 2
  },
  
  // Truth or Dare (Wild)
  {
    type: "Truth or Dare",
    text: "TRUTH: What's something you've never told anyone in this room? OR DARE: Let the group look through your phone for 1 minute",
    intensity: 3
  },
  
  // Act It Out (Mild)
  {
    type: "Act It Out",
    text: "Act out your favorite movie scene and have others guess what it is",
    intensity: 1
  },
  
  // Act It Out (Medium)
  {
    type: "Act It Out",
    text: "Do your best dance move without music",
    intensity: 2
  },
  
  // Act It Out (Wild)
  {
    type: "Act It Out",
    text: "Act out your most embarrassing moment without speaking",
    intensity: 3
  }
];

export const getLevelName = (level: number): string => {
  switch (level) {
    case 1: return "Icebreaker";
    case 2: return "Getting to Know You";
    case 3: return "Deeper Dive";
    default: return "Icebreaker";
  }
};

export const getIntensityName = (intensity: number): string => {
  switch (intensity) {
    case 1: return "Mild";
    case 2: return "Medium";
    case 3: return "Wild";
    default: return "Mild";
  }
};
