export type GameMode = 'intro' | 'game' | 'intermission' | 'leaderboard' | 'outro';

export interface GameState {
  mode: GameMode;
  customText: string;
  
  // Game-specific state (only relevant when mode === 'game')
  currentGame?: {
    comedianId: string;
    promptId: string;
    gamePhase: 'selecting-comic' | 'selecting-prompt' | 'teams-voting' | 'revealed';
    teamAVote?: 'lie' | 'truth';
    teamBVote?: 'lie' | 'truth';
    actualAnswer?: 'lie' | 'truth';
  };
  
  // Teams
  teams: {
    teamA: { name: string; score: number };
    teamB: { name: string; score: number };
  };
}

export interface Comedian {
  id: string;
  name: string;
  instagram: string;
  score: number;
  prompts: Prompt[];
  team: 'teamA' | 'teamB' | 'host' | null; // Add team assignment
  password?: string; // Store password here for simplicity
}

export interface ComedianInput {
  name: string;
  instagram: string;
  password: string;
  team: 'teamA' | 'teamB' | 'host' | null;
}

export interface Prompt {
  id: string;
  text: string;
  actualAnswer: 'lie' | 'truth';
}

export interface ComedianSession {
  comedianId: string;
  name: string;
  isAuthenticated: boolean;
}