export type { IGameState } from './models/GameState';
export type { IComedian } from './models/Comedian';
export type { IVote } from './models/Vote';

// Input types for API
export interface ComedianInput {
  name: string;
  instagram: string;
  password: string;
  team: 'teamA' | 'teamB' | 'host';
}

export interface ComedianSession {
  comedianId: string;
  name: string;
  isAuthenticated: boolean;
}