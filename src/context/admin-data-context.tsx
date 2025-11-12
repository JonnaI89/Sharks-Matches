"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Match, Player, Team, MatchEvent, SaveEvent, GoalEvent, Tournament, TournamentGroup } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AdminDataContextType {
    matches: Match[];
    teams: Record<string, Team>;
    players: Player[];
    tournaments: Tournament[];
    isDataLoaded: boolean;
    addMatch: (matchData: Omit<Match, 'id' | 'teamA' | 'teamB' | 'rosterA' | 'rosterB' | 'events' | 'status' | 'scoreA' | 'scoreB' | 'period' | 'time' | 'breakEndTime'> & { teamAId: string, teamBId: string }) => Promise<void>;
    updateMatch: (match: Match) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    updateTeam: (teamId: string, teamData: Omit<Team, 'id'>) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;
    addPlayer: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'stats'>) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
    addTournament: (name: string) => Promise<void>;
    deleteTournament: (tournamentId: string) => Promise<void>;
    updateTournament: (tournament: Tournament) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const sanitizeMatchForFirebase = (match: Match | Omit<Match, 'id'>) => {
    const sanitizedMatch = JSON.parse(JSON.stringify(match));
    
    sanitizedMatch.teamA = { id: match.teamA.id };
    sanitizedMatch.teamB = { id: match.teamB.id };

    delete sanitizedMatch.rosterA;
    delete sanitizedMatch.rosterB;

    sanitizedMatch.events = match.events.map(event => {
        const newEvent = { ...event };
        if (newEvent.type === 'goal') {
            newEvent.scorer = { id: newEvent.scorer.id };
            if (newEvent.assist) {
                newEvent.assist = { id: newEvent.assist.id };
            }
        } else if (newEvent.type === 'penalty') {
            newEvent.player = { id: newEvent.player.id };
        } else if (newEvent.type === 'save') {
            newEvent.goalie = { id: newEvent.goalie.id };
        }
        return newEvent;
    });

    return sanitizedMatch;
};


export function AdminDataProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Record<string, Team>>({});
    const [players, setPlayers] = useState<Player[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [rawMatches, setRawMatches] = useState<any[] | null>(null);

    const [loadingStatus, setLoadingStatus] = useState({
        teams: true,
        players: true,
        matches: true,
        tournaments: true,
    });
    const isRawDataLoaded = !loadingStatus.teams && !loadingStatus.players && !loadingStatus.matches && !loadingStatus.tournaments;

    useEffect(() => {
        const handleError = (error: Error, type: string) => {
            console.error(`Failed to fetch ${type} from Firestore`, error);
            toast({
                title: `Error Loading ${type}`,
                description: `Could not connect to the database for ${type}.`,
                variant: "destructive",
            });
            setLoadingStatus(s => ({ ...s, [type.toLowerCase()]: false }));
        };

        const unsubTeams = onSnapshot(collection(db, "teams"), (snapshot) => {
            const teamsData: Record<string, Team> = {};
            snapshot.forEach(doc => {
                teamsData[doc.id] = { id: doc.id, ...doc.data() } as Team;
            });
            setTeams(teamsData);
            setLoadingStatus(s => ({ ...s, teams: false }));
        }, (err) => handleError(err, "teams"));

        const unsubPlayers = onSnapshot(collection(db, "players"), (snapshot) => {
            const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
            setPlayers(playersData);
            setLoadingStatus(s => ({ ...s, players: false }));
        }, (err) => handleError(err, "players"));

        const unsubMatches = onSnapshot(collection(db, "matches"), (snapshot) => {
             setRawMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
             setLoadingStatus(s => ({ ...s, matches: false }));
        }, (err) => handleError(err, "matches"));

        const unsubTournaments = onSnapshot(collection(db, "tournaments"), (snapshot) => {
            const tourneyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
            setTournaments(tourneyData);
            setLoadingStatus(s => ({...s, tournaments: false}));
        }, (err) => handleError(err, "tournaments"));

        return () => {
            unsubTeams();
            unsubPlayers();
            unsubMatches();
            unsubTournaments();
        };
    }, [toast]);

    useEffect(() => {
        if (!isRawDataLoaded || rawMatches === null) {
            return;
        }

        const hydratedMatches = rawMatches.map(match => {
            const teamA = teams[match.teamA?.id];
            const teamB = teams[match.teamB?.id];

            if (!teamA || !teamB) return null;

            const hydratedEvents = (match.events || []).map((event: any) => {
                if (event.type === 'goal') {
                    const scorer = players.find(p => p.id === event.scorer?.id);
                    if (!scorer) return null;
                    const assist = event.assist?.id ? players.find(p => p.id === event.assist.id) : undefined;
                    return { ...event, scorer, assist: assist || undefined };
                }
                if (event.type === 'penalty') {
                     const player = players.find(p => p.id === event.player?.id);
                     if (!player) return null;
                     return { ...event, player };
                }
                if (event.type === 'save') {
                    const goalie = players.find(p => p.id === event.goalie?.id);
                    if (!goalie) return null;
                    return { ...event, goalie };
                }
                return event;
            }).filter((e): e is MatchEvent => e !== null);

            const rosterA_withStats = players
                .filter(p => p.teamId === teamA.id)
                .map(p => ({ ...p, stats: { goals: 0, assists: 0, penalties: 0, saves: 0, goalsAgainst: 0 } }));
            
            const rosterB_withStats = players
                .filter(p => p.teamId === teamB.id)
                .map(p => ({ ...p, stats: { goals: 0, assists: 0, penalties: 0, saves: 0, goalsAgainst: 0 } }));

            hydratedEvents.forEach(event => {
                const isTeamAEvent = event.teamId === teamA.id;
                
                if (event.type === 'goal') {
                    const goalEvent = event as GoalEvent;
                    const scorerRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                    const scorer = scorerRoster.find(p => p.id === goalEvent.scorer.id);
                    if (scorer) scorer.stats.goals += 1;
                    
                    if (goalEvent.assist) {
                        const assistRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                        const assister = assistRoster.find(p => p.id === goalEvent.assist.id);
                        if (assister) assister.stats.assists += 1;
                    }

                    if (goalEvent.concedingGoalieId) {
                        const concedingRoster = isTeamAEvent ? rosterB_withStats : rosterA_withStats;
                        const goalie = concedingRoster.find(p => p.id === goalEvent.concedingGoalieId);
                        if(goalie) {
                            goalie.stats.goalsAgainst = (goalie.stats.goalsAgainst || 0) + 1;
                        }
                    }

                } else if (event.type === 'penalty') {
                    const penaltyRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                    const player = penaltyRoster.find(p => p.id === event.player.id);
                    if (player) player.stats.penalties += event.duration;
                } else if (event.type === 'save') {
                    const saveEvent = event as SaveEvent;
                    const savingRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                    const goalie = savingRoster.find(p => p.id === saveEvent.goalie.id);
                    if (goalie) {
                        goalie.stats.saves = (goalie.stats.saves || 0) + 1;
                    }
                }
            });

            const hydratedMatch: Match = {
                ...match,
                teamA,
                teamB,
                rosterA: rosterA_withStats,
                rosterB: rosterB_withStats,
                events: hydratedEvents
            };
            return hydratedMatch;
        }).filter((m): m is Match => m !== null);
        
        setMatches(hydratedMatches);
        setIsDataLoaded(true);

    }, [rawMatches, teams, players, isRawDataLoaded]);

    const addMatch = useCallback(async (matchData: Omit<Match, 'id' | 'teamA' | 'teamB' | 'rosterA' | 'rosterB' | 'events' | 'status' | 'scoreA' | 'scoreB' | 'period' | 'time' | 'breakEndTime'> & { teamAId: string, teamBId: string }) => {
        const { teamAId, teamBId, ...rest } = matchData;
        const teamA = teams[teamAId];
        const teamB = teams[teamBId];
        if (!teamA || !teamB) return;

        const newMatchData: Omit<Match, 'id'> = {
            ...rest,
            status: 'upcoming', teamA, teamB, scoreA: 0, scoreB: 0, period: 1,
            time: '00:00', breakEndTime: null, events: [],
            rosterA: players.filter(p => p.teamId === teamAId),
            rosterB: players.filter(p => p.teamId === teamBId),
        };
        
        try {
            const sanitizedMatch = sanitizeMatchForFirebase(newMatchData);
            await addDoc(collection(db, "matches"), sanitizedMatch);
        } catch (error) {
            console.error("Error adding match: ", error);
        }
    }, [players, teams]);

    const updateMatch = useCallback(async (matchToUpdate: Match) => {
        try {
            const sanitizedMatch = sanitizeMatchForFirebase(matchToUpdate);
            const { id, ...matchData } = sanitizedMatch;
            await setDoc(doc(db, "matches", matchToUpdate.id), matchData);
        } catch (error) {
            console.error("Error updating match: ", error);
        }
    }, []);

    const deleteMatch = useCallback(async (matchId: string) => {
        try {
            await deleteDoc(doc(db, "matches", matchId));
        } catch (error) {
            console.error("Error deleting match: ", error);
        }
    }, []);
    
    const addTeam = useCallback(async (newTeam: Omit<Team, 'id'>) => {
        try {
            await addDoc(collection(db, "teams"), newTeam);
        } catch (error) {
            console.error("Error adding team: ", error);
        }
    }, []);
    
    const updateTeam = useCallback(async (teamId: string, teamData: Omit<Team, 'id'>) => {
        try {
            const teamDocRef = doc(db, "teams", teamId);
            await setDoc(teamDocRef, teamData);
        } catch (error) {
            console.error("Error updating team: ", error);
            toast({
                title: "Error",
                description: "Could not update team information.",
                variant: "destructive",
            });
        }
    }, [toast]);

    const deleteTeam = useCallback(async (teamId: string) => {
        if (players.some(p => p.teamId === teamId)) {
            toast({ title: "Cannot Remove Team", description: "Please remove all players from the team first.", variant: "destructive" });
            return;
        }
        if (matches && matches.some(m => m.teamA.id === teamId || m.teamB.id === teamId)) {
            toast({ title: "Cannot Remove Team", description: "This team is in a match. Please remove the match first.", variant: "destructive" });
            return;
        }
        try {
            await deleteDoc(doc(db, "teams", teamId));
        } catch (error) {
            console.error("Error deleting team: ", error);
        }
    }, [matches, players, toast]);

    const addPlayer = useCallback(async (teamId: string, newPlayer: Omit<Player, 'id' | 'teamId' | 'stats'>) => {
        const playerToAdd = {
            ...newPlayer,
            teamId: teamId,
            stats: { goals: 0, assists: 0, penalties: 0 },
        };
        try {
            await addDoc(collection(db, "players"), playerToAdd);
        } catch(e) {
            console.error("Error adding player: ", e);
        }
    }, []);

    const deletePlayer = useCallback(async (playerId: string) => {
        try {
            await deleteDoc(doc(db, "players", playerId));
        } catch(e) {
            console.error("Error deleting player: ", e);
        }
    }, []);

    const addTournament = useCallback(async (name: string) => {
        try {
            await addDoc(collection(db, "tournaments"), { name, groups: [] });
        } catch (error) {
            console.error("Error adding tournament: ", error);
        }
    }, []);

    const deleteTournament = useCallback(async (tournamentId: string) => {
        try {
            const batch = writeBatch(db);
            // Delete the tournament document
            const tournamentDocRef = doc(db, "tournaments", tournamentId);
            batch.delete(tournamentDocRef);
            
            // Find and delete associated matches
            const associatedMatches = matches.filter(m => m.tournamentId === tournamentId);
            associatedMatches.forEach(match => {
                const matchDocRef = doc(db, "matches", match.id);
                batch.delete(matchDocRef);
            });

            await batch.commit();

        } catch (error) {
            console.error("Error deleting tournament: ", error);
            toast({
                title: "Error",
                description: "Could not delete tournament and its matches.",
                variant: "destructive"
            });
        }
    }, [matches, toast]);

    const updateTournament = useCallback(async (tournament: Tournament) => {
        try {
            const { id, ...tournamentData } = tournament;
            await setDoc(doc(db, "tournaments", id), tournamentData);
        } catch (error) {
            console.error("Error updating tournament: ", error);
        }
    }, []);

    const value = {
        matches: matches || [],
        teams, 
        players,
        tournaments,
        isDataLoaded,
        addMatch, updateMatch, deleteMatch, addTeam, updateTeam, deleteTeam, addPlayer, deletePlayer,
        addTournament, deleteTournament, updateTournament,
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error('useAdminData must be used within an AdminDataProvider');
    }
    return context;
}
