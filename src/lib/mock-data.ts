import type { Match } from './types';

export const teams = {
  team1: { id: 'team1', name: 'Stockholm Strikers', logo: 'S' },
  team2: { id: 'team2', name: 'Gothenburg Gators', logo: 'G' },
  team3: { id: 'team3', name: 'Malmö Mavericks', logo: 'M' },
  team4: { id: 'team4', name: 'Uppsala Unicorns', logo: 'U' },
};

const rosterStrikers: Match['rosterA'] = [
  { id: 'p1', name: 'Erik Svensson', number: 10, stats: { goals: 1, assists: 0, penalties: 0 } },
  { id: 'p2', name: 'Lars Andersson', number: 22, stats: { goals: 0, assists: 1, penalties: 1 } },
  { id: 'p3', name: 'Mikael Nilsson', number: 5, stats: { goals: 1, assists: 0, penalties: 0 } },
  { id: 'g1', name: 'Oskar Johansson', number: 1, isGoalie: true, stats: { goals: 0, assists: 0, penalties: 0 } },
];

const rosterGators: Match['rosterB'] = [
  { id: 'p4', name: 'Anders Karlsson', number: 7, stats: { goals: 1, assists: 0, penalties: 0 } },
  { id: 'p5', name: 'Johan Gustafsson', number: 19, stats: { goals: 0, assists: 0, penalties: 0 } },
  { id: 'p6', name: 'Nils Olsson', number: 3, stats: { goals: 0, assists: 1, penalties: 0 } },
  { id: 'g2', name: 'Karl Lindberg', number: 30, isGoalie: true, stats: { goals: 0, assists: 0, penalties: 0 } },
];

export const matches: Match[] = [
  {
    id: 'match1',
    status: 'live',
    teamA: teams.team1,
    teamB: teams.team2,
    scoreA: 2,
    scoreB: 1,
    period: 2,
    time: '12:45',
    rosterA: rosterStrikers,
    rosterB: rosterGators,
    events: [
      { id: 'e1', type: 'goal', teamId: 'team1', scorer: rosterStrikers[0], time: '05:21', period: 1 },
      { id: 'e2', type: 'penalty', teamId: 'team2', player: rosterGators[1], duration: 2, time: '11:30', period: 1 },
      { id: 'e3', type: 'goal', teamId: 'team2', scorer: rosterGators[0], assist: rosterGators[2], time: '18:55', period: 1 },
      { id: 'e4', type: 'goal', teamId: 'team1', scorer: rosterStrikers[2], assist: rosterStrikers[1], time: '08:13', period: 2 },
    ],
  },
  {
    id: 'match2',
    status: 'upcoming',
    teamA: teams.team3,
    teamB: teams.team4,
    scoreA: 0,
    scoreB: 0,
    period: 1,
    time: '00:00',
    rosterA: [],
    rosterB: [],
    events: [],
  },
  {
    id: 'match3',
    status: 'finished',
    teamA: teams.team1,
    teamB: teams.team4,
    scoreA: 5,
    scoreB: 3,
    period: 3,
    time: '20:00',
    rosterA: [],
    rosterB: [],
    events: [],
  },
];
