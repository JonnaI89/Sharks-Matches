"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Match, Player, Team, MatchEvent, SaveEvent } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AdminDataContextType {
    matches: Match[];
    teams: Record<string, Team>;
    players: Player[];
    isDataLoaded: boolean;
    addMatch: (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number, breakDurationMinutes: number) => Promise<void>;
    updateMatch: (match: Match) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    updateTeam: (teamId: string, teamData: Omit<Team, 'id'>) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;
    addPlayer: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'stats'>) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
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
    const [rawMatches, setRawMatches] = useState<any[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [loadingStatus, setLoadingStatus] = useState({
        teams: true,
        players: true,
        matches: true,
    });
    const isRawDataLoaded = !loadingStatus.teams && !loadingStatus.players && !loadingStatus.matches;

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

        return () => {
            unsubTeams();
            unsubPlayers();
            unsubMatches();
        };
    }, [toast]);

    useEffect(() => {
        if (!isRawDataLoaded) {
            setIsDataLoaded(false);
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
                .map(p => ({ ...p, stats: { goals: 0, assists: 0, penalties: 0 } }));
            
            const rosterB_withStats = players
                .filter(p => p.teamId === teamB.id)
                .map(p => ({ ...p, stats: { goals: 0, assists: 0, penalties: 0 } }));

            hydratedEvents.forEach(event => {
                const isTeamAEvent = event.teamId === teamA.id;
                
                if (event.type === 'goal') {
                    const scorerRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                    const scorer = scorerRoster.find(p => p.id === event.scorer.id);
                    if (scorer) scorer.stats.goals += 1;
                    
                    if (event.assist) {
                        const assistRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                        const assister = assistRoster.find(p => p.id === event.assist.id);
                        if (assister) assister.stats.assists += 1;
                    }
                } else if (event.type === 'penalty') {
                    const penaltyRoster = isTeamAEvent ? rosterA_withStats : rosterB_withStats;
                    const player = penaltyRoster.find(p => p.id === event.player.id);
                    if (player) player.stats.penalties += event.duration;
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

    const addMatch = useCallback(async (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number, breakDurationMinutes: number) => {
        const teamA = teams[teamAId];
        const teamB = teams[teamBId];
        if (!teamA || !teamB) return;

        const newMatchData: Omit<Match, 'id'> = {
            status: 'upcoming', teamA, teamB, scoreA: 0, scoreB: 0, period: 1,
            time: '00:00', totalPeriods, periodDurationMinutes, breakDurationMinutes, breakEndTime: null, events: [],
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
        if (matches.some(m => m.teamA.id === teamId || m.teamB.id === teamId)) {
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

    const value = {
        matches, teams, players, isDataLoaded,
        addMatch, updateMatch, deleteMatch, addTeam, updateTeam, deleteTeam, addPlayer, deletePlayer,
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
