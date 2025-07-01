"use client";

import { useMemo } from 'react';
import { useAdminData } from "@/context/admin-data-context";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsTable } from '@/components/stats-table';
import type { Player, MatchEvent, SaveEvent, GoalEvent } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

export interface CareerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  penalties: number;
  saves: number;
  goalsAgainst: number;
}

export default function StatsPage() {
  const { matches, teams, players, isDataLoaded } = useAdminData();
  const teamsArray = useMemo(() => Object.values(teams), [teams]);

  const careerStats = useMemo(() => {
    if (!isDataLoaded) return new Map<string, CareerStats>();

    const statsMap = new Map<string, CareerStats>();
    const playedInMatch = new Map<string, Set<string>>();

    players.forEach(p => {
      statsMap.set(p.id, { gamesPlayed: 0, goals: 0, assists: 0, penalties: 0, saves: 0, goalsAgainst: 0 });
      playedInMatch.set(p.id, new Set());
    });
    
    const finishedMatches = matches.filter(m => m.status === 'finished');

    for (const match of finishedMatches) {
        const matchPlayers = [...match.rosterA, ...match.rosterB];
        matchPlayers.forEach(p => {
            if(playedInMatch.has(p.id)) {
                playedInMatch.get(p.id)?.add(match.id);
            }
        });

        for (const event of match.events) {
            let playerStats: CareerStats | undefined;

            switch (event.type) {
                case 'goal':
                    const goalEvent = event as GoalEvent;
                    const scorerStats = statsMap.get(goalEvent.scorer.id);
                    if(scorerStats) scorerStats.goals++;
                    
                    if (goalEvent.assist) {
                        const assistStats = statsMap.get(goalEvent.assist.id);
                        if(assistStats) assistStats.assists++;
                    }

                    if (goalEvent.concedingGoalieId) {
                        const goalieStats = statsMap.get(goalEvent.concedingGoalieId);
                        if(goalieStats) goalieStats.goalsAgainst++;
                    }
                    break;
                case 'penalty':
                    playerStats = statsMap.get(event.player.id);
                    if(playerStats) playerStats.penalties += event.duration;
                    break;
                case 'save':
                    const saveEvent = event as SaveEvent;
                    playerStats = statsMap.get(saveEvent.goalie.id);
                    if(playerStats) playerStats.saves++;
                    break;
            }
        }
    }
    
    playedInMatch.forEach((matchIds, playerId) => {
        const pStats = statsMap.get(playerId);
        if (pStats) {
            pStats.gamesPlayed = matchIds.size;
        }
    });

    return statsMap;
  }, [matches, players, isDataLoaded]);
  
  if (!isDataLoaded) {
      return (
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">League Statistics</h1>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">League Statistics</h1>
        
        {teamsArray.length > 0 ? (
          <Tabs defaultValue={teamsArray[0].id} className="w-full">
            <TabsList>
              {teamsArray.map(team => (
                <TabsTrigger key={team.id} value={team.id}>{team.name}</TabsTrigger>
              ))}
            </TabsList>
            {teamsArray.map(team => {
              const teamPlayers = players
                .filter(p => p.teamId === team.id)
                .map(p => ({
                  ...p,
                  careerStats: careerStats.get(p.id) || { gamesPlayed: 0, goals: 0, assists: 0, penalties: 0, saves: 0, goalsAgainst: 0 }
                }));

              return (
                <TabsContent key={team.id} value={team.id}>
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>{team.name} - Player Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatsTable players={teamPlayers} />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <Card className="mt-4">
            <CardContent className="pt-6">
                <p>No teams available to display statistics.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
