"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Match, Player, Team } from '@/lib/types';
import { 
    matches as initialMatches, 
    teams as initialTeams, 
    players as initialPlayers 
} from '@/lib/mock-data';

interface AdminDataContextType {
    matches: Match[];
    setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
    teams: Record<string, Team>;
    setTeams: React.Dispatch<React.SetStateAction<Record<string, Team>>>;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
    const [matches, setMatches] = useState<Match[]>(initialMatches);
    const [teams, setTeams] = useState<Record<string, Team>>(initialTeams);
    const [players, setPlayers] = useState<Player[]>(initialPlayers);

    const value = {
        matches,
        setMatches,
        teams,
        setTeams,
        players,
        setPlayers,
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
