export interface AmbiguousTerm {
  pattern: RegExp;
  term: string;
  question: string;
  options: string[];
}

export const ambiguousTerms: AmbiguousTerm[] = [
  {
    pattern: /small eyes?/i,
    term: "small eyes",
    question: "Can you describe the eye shape more specifically?",
    options: ["narrow", "slanted", "round but small", "almond-shaped", "deep-set"]
  },
  {
    pattern: /large eyes?|big eyes?/i,
    term: "large eyes",
    question: "How would you describe the large eyes?",
    options: ["wide", "bulging", "round", "prominent", "protruding"]
  },
  {
    pattern: /long nose|big nose/i,
    term: "long/big nose",
    question: "Can you be more specific about the nose?",
    options: ["hooked", "straight and long", "wide bridge", "bulbous tip", "aquiline"]
  },
  {
    pattern: /small nose|short nose/i,
    term: "small/short nose",
    question: "What type of small nose was it?",
    options: ["button nose", "upturned", "flat bridge", "narrow", "petite"]
  },
  {
    pattern: /thick lips?|full lips?/i,
    term: "thick/full lips",
    question: "How would you describe the lip fullness?",
    options: ["evenly full", "fuller lower lip", "fuller upper lip", "plump", "pouty"]
  },
  {
    pattern: /thin lips?/i,
    term: "thin lips",
    question: "Can you describe the thin lips more specifically?",
    options: ["very narrow", "barely visible", "tight", "compressed", "straight line"]
  },
  {
    pattern: /broad face|wide face/i,
    term: "broad/wide face",
    question: "What face shape best describes it?",
    options: ["square jaw", "round", "oval but wide", "rectangular", "diamond-shaped"]
  },
  {
    pattern: /narrow face|thin face/i,
    term: "narrow/thin face",
    question: "How would you describe the narrow face?",
    options: ["oval", "elongated", "heart-shaped", "angular", "gaunt"]
  },
  {
    pattern: /dark hair/i,
    term: "dark hair",
    question: "What shade of dark hair?",
    options: ["black", "dark brown", "very dark brown", "jet black", "dark with gray"]
  },
  {
    pattern: /light hair|blonde hair?/i,
    term: "light/blonde hair",
    question: "What shade of light hair?",
    options: ["platinum blonde", "golden blonde", "dirty blonde", "light brown", "strawberry blonde"]
  },
  {
    pattern: /short hair/i,
    term: "short hair",
    question: "How short was the hair?",
    options: ["buzz cut", "crew cut", "chin-length", "ear-length", "very short"]
  },
  {
    pattern: /long hair/i,
    term: "long hair",
    question: "How long was the hair?",
    options: ["shoulder-length", "mid-back", "waist-length", "very long", "past shoulders"]
  },
  {
    pattern: /heavy build|large build/i,
    term: "heavy/large build",
    question: "Can you describe the build more specifically?",
    options: ["muscular", "stocky", "overweight", "broad-shouldered", "heavyset"]
  },
  {
    pattern: /thin build|slim build|skinny/i,
    term: "thin/slim build",
    question: "How would you describe the slim build?",
    options: ["lean", "athletic", "very thin", "wiry", "slender"]
  },
  {
    pattern: /medium build|average build/i,
    term: "medium/average build",
    question: "Can you be more specific about the build?",
    options: ["proportional", "slightly athletic", "average weight", "moderate frame", "neither thin nor heavy"]
  }
];

export interface Clarification {
  term: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export function detectAmbiguousTerms(description: string): AmbiguousTerm[] {
  const detectedTerms: AmbiguousTerm[] = [];
  
  for (const term of ambiguousTerms) {
    if (term.pattern.test(description)) {
      detectedTerms.push(term);
    }
  }
  
  return detectedTerms;
}

export function buildRefinedDescription(
  originalDescription: string,
  clarifications: Clarification[]
): string {
  let refined = originalDescription;
  
  for (const clarification of clarifications) {
    // Replace the ambiguous term with the clarified version
    const pattern = ambiguousTerms.find(t => t.term === clarification.term)?.pattern;
    if (pattern) {
      refined = refined.replace(pattern, clarification.answer);
    }
  }
  
  return refined;
}
