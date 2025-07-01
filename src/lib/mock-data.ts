import type { Match, Player, Team } from './types';

// Data is now managed and persisted via AdminDataProvider and localStorage.
// These are left empty as a base structure.

export const teams: Record<string, Team> = {};

export const players: Player[] = [];

export const matches: Match[] = [];
