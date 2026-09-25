export interface RawQuestion {
  id?: number | string;
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string; // "A" | "B" | "C" | "D"
  difficulty?: number; // 1, 2, 3...
  explanation?: string;
}

export interface QuestionItem extends RawQuestion {
  id: number;
  originalIndex: number;
  status: 'pending' | 'active' | 'correct' | 'wrong';
  selectedAnswer?: string;
}

export type GameThemeType = 'frog' | 'princess' | 'snail';

export interface GameTheme {
  id: GameThemeType;
  title: string;
  subtitle: string;
  characterName: string;
  characterImage?: string;
  destinationName: string;
  destinationImage?: string;
  stepName: string;
  stepImage?: string;
  description: string;
  backgroundTheme: string;
  primaryColor: string;
}

