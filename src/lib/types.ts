export interface Team {
  id: string;
  name: string;
  logo: string;
}

export interface Player {
  id:string;
  name: string;
  number: number;
  isGoalie?: boolean;
  teamId: string;
  stats: {
    goals: number;
    assists: number;
    penalties: number;
  };
}

export interface GoalEvent {
  type: 'goal';
  id: string;
  teamId: string;
  scorer: Player;
  assist?: Player;
  time: string; // e.g., "15:34"
  period: number;
}

export interface PenaltyEvent {
  type: 'penalty';
  id: string;
  teamId: string;
  player: Player;
  duration: number; // in minutes
  time: string;
  period: number;
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: {
    period: number;
    time: string;
  } | null;
}

export type MatchEvent = GoalEvent | PenaltyEvent;

export interface Match {
  id: string;
  status: 'upcoming' | 'live' | 'paused' | 'finished';
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  period: number;
  time: string; // current match time
  totalPeriods: number;
  periodDurationMinutes: number;
  events: MatchEvent[];
  rosterA: Player[];
  rosterB: Player[];
}
