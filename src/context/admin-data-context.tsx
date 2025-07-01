"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Match, Player, Team } from '@/lib/types';

interface AdminDataContextType {
    matches: Match[];
    setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
    teams: Record<string, Team>;
    setTeams: React.Dispatch<React.SetStateAction<Record<string, Team>>>;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    isDataLoaded: boolean;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
    MATCHES: 'floorball_matches',
    TEAMS: 'floorball_teams',
    PLAYERS: 'floorball_players'
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Record<string, Team>>({});
    const [players, setPlayers] = useState<Player[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Load data from localStorage on initial mount
    useEffect(() => {
        try {
            const storedMatches = localStorage.getItem(LOCAL_STORAGE_KEYS.MATCHES);
            if (storedMatches) setMatches(JSON.parse(storedMatches));

            const storedTeams = localStorage.getItem(LOCAL_STORAGE_KEYS.TEAMS);
            if (storedTeams) setTeams(JSON.parse(storedTeams));

            const storedPlayers = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYERS);
            if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        } finally {
            setIsDataLoaded(true);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.MATCHES, JSON.stringify(matches));
        }
    }, [matches, isDataLoaded]);

    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TEAMS, JSON.stringify(teams));
        }
    }, [teams, isDataLoaded]);

    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYERS, JSON.stringify(players));
        }
    }, [players, isDataLoaded]);

    const value = {
        matches,
        setMatches,
        teams,
        setTeams,
        players,
        setPlayers,
        isDataLoaded,
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
