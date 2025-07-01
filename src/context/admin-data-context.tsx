"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Match, Player, Team } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AdminDataContextType {
    matches: Match[];
    teams: Record<string, Team>;
    players: Player[];
    isDataLoaded: boolean;
    addMatch: (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number) => Promise<void>;
    updateMatch: (match: Match) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;
    addPlayer: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'stats'>) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Firestore objects can't contain nested custom objects directly,
// so we store references (just the ID) and re-hydrate on read.
// This helper function strips down the complex objects before writing.
const sanitizeMatchForFirebase = (match: Match | Omit<Match, 'id'>) => {
    const sanitizedMatch = JSON.parse(JSON.stringify(match));
    
    // Sanitize teams to store as references
    sanitizedMatch.teamA = { id: match.teamA.id };
    sanitizedMatch.teamB = { id: match.teamB.id };

    // Don't store rosters in the match document, they are derived from players list
    delete sanitizedMatch.rosterA;
    delete sanitizedMatch.rosterB;

    // Sanitize events
    sanitizedMatch.events = match.events.map(event => {
        const newEvent = { ...event };
        if (newEvent.type === 'goal') {
            newEvent.scorer = { id: newEvent.scorer.id };
            if (newEvent.assist) {
                newEvent.assist = { id: newEvent.assist.id };
            }
        } else if (newEvent.type === 'penalty') {
            newEvent.player = { id: newEvent.player.id };
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
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const fetchData = useCallback(async () => {
        setIsDataLoaded(false);
        try {
            // Fetch Teams
            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teamsData: Record<string, Team> = {};
            teamsSnapshot.forEach(doc => {
                teamsData[doc.id] = { id: doc.id, ...doc.data() } as Team;
            });
            setTeams(teamsData);

            // Fetch Players
            const playersSnapshot = await getDocs(collection(db, "players"));
            const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
            setPlayers(playersData);
            
            // Fetch Matches and hydrate team/roster data
            const matchesSnapshot = await getDocs(collection(db, "matches"));
            const matchesData = matchesSnapshot.docs.map(doc => {
                const data = doc.data();
                const teamA = teamsData[data.teamA.id];
                const teamB = teamsData[data.teamB.id];
                
                if (!teamA || !teamB) return null;

                // We need to re-hydrate the nested objects from our fetched data
                const hydratedMatch: Match = {
                    id: doc.id,
                    ...data,
                    teamA: teamA,
                    teamB: teamB,
                    rosterA: playersData.filter(p => p.teamId === data.teamA.id),
                    rosterB: playersData.filter(p => p.teamId === data.teamB.id),
                    events: data.events.map((event: any) => {
                        if (event.type === 'goal') {
                            return {
                                ...event,
                                scorer: playersData.find(p => p.id === event.scorer.id),
                                assist: event.assist ? playersData.find(p => p.id === event.assist.id) : undefined,
                            };
                        }
                        if (event.type === 'penalty') {
                             return {
                                ...event,
                                player: playersData.find(p => p.id === event.player.id),
                            };
                        }
                        return event;
                    })
                };
                return hydratedMatch;
            }).filter((m): m is Match => m !== null);
            
            setMatches(matchesData);

        } catch (error) {
            console.error("Failed to fetch data from Firestore", error);
            toast({
                title: "Error Loading Data",
                description: "Could not connect to the database. Check connection and Firebase setup.",
                variant: "destructive",
            });
        } finally {
            setIsDataLoaded(true);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addMatch = async (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number) => {
        const teamA = teams[teamAId];
        const teamB = teams[teamBId];
        if (!teamA || !teamB) return;

        const newMatchData: Omit<Match, 'id'> = {
            status: 'upcoming', teamA, teamB, scoreA: 0, scoreB: 0, period: 1,
            time: '00:00', totalPeriods, periodDurationMinutes, events: [],
            rosterA: players.filter(p => p.teamId === teamAId),
            rosterB: players.filter(p => p.teamId === teamBId),
        };
        
        try {
            const sanitizedMatch = sanitizeMatchForFirebase(newMatchData);
            const docRef = await addDoc(collection(db, "matches"), sanitizedMatch);
            setMatches(prev => [...prev, {...newMatchData, id: docRef.id}]);
        } catch (error) {
            console.error("Error adding match: ", error);
        }
    };

    const updateMatch = async (matchToUpdate: Match) => {
        try {
            const sanitizedMatch = sanitizeMatchForFirebase(matchToUpdate);
            const { id, ...matchData } = sanitizedMatch;
            await setDoc(doc(db, "matches", matchToUpdate.id), matchData);
            setMatches(prev => prev.map(m => m.id === matchToUpdate.id ? matchToUpdate : m));
        } catch (error) {
            console.error("Error updating match: ", error);
        }
    };

    const deleteMatch = async (matchId: string) => {
        try {
            await deleteDoc(doc(db, "matches", matchId));
            setMatches(prev => prev.filter(match => match.id !== matchId));
        } catch (error) {
            console.error("Error deleting match: ", error);
        }
    };
    
    const addTeam = async (newTeam: Omit<Team, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "teams"), newTeam);
            const teamToAdd: Team = { ...newTeam, id: docRef.id };
            setTeams(prev => ({ ...prev, [docRef.id]: teamToAdd }));
        } catch (error) {
            console.error("Error adding team: ", error);
        }
    };

    const deleteTeam = async (teamId: string) => {
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
            setTeams(prev => {
                const newTeams = { ...prev };
                delete newTeams[teamId];
                return newTeams;
            });
        } catch (error) {
            console.error("Error deleting team: ", error);
        }
    };

    const addPlayer = async (teamId: string, newPlayer: Omit<Player, 'id' | 'teamId' | 'stats'>) => {
        const playerToAdd = {
            ...newPlayer,
            teamId: teamId,
            stats: { goals: 0, assists: 0, penalties: 0 },
        };
        try {
            const docRef = await addDoc(collection(db, "players"), playerToAdd);
            setPlayers(prev => [ ...prev, { ...playerToAdd, id: docRef.id } ]);
        } catch(e) {
            console.error("Error adding player: ", e);
        }
    };

    const deletePlayer = async (playerId: string) => {
        try {
            await deleteDoc(doc(db, "players", playerId));
            setPlayers(prev => prev.filter(p => p.id !== playerId));
        } catch(e) {
            console.error("Error deleting player: ", e);
        }
    };

    const value = {
        matches, teams, players, isDataLoaded,
        addMatch, updateMatch, deleteMatch, addTeam, deleteTeam, addPlayer, deletePlayer,
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
