"use client";

import { useMemo } from 'react';
import { useAdminData } from '@/context/admin-data-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Standing, Match, Tournament, TournamentGroup, Team } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { MatchCard } from '@/components/match-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function calculateStandings(matches: Match[], teams: Team[]): Standing[] {
  const standingsMap = new Map<string, Standing>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });
  
  const finishedMatches = matches.filter(m => m.status === 'finished');

  for (const match of finishedMatches) {
    const teamAStats = standingsMap.get(match.teamA.id);
    const teamBStats = standingsMap.get(match.teamB.id);
    
    if (!teamAStats || !teamBStats) continue;

    teamAStats.played++;
    teamBStats.played++;

    teamAStats.goalsFor += match.scoreA;
    teamAStats.goalsAgainst += match.scoreB;
    teamBStats.goalsFor += match.scoreB;
    teamBStats.goalsAgainst += match.scoreA;

    if (match.scoreA > match.scoreB) {
      teamAStats.wins++;
      teamBStats.losses++;
      teamAStats.points += 3;
    } else if (match.scoreB > match.scoreA) {
      teamBStats.wins++;
      teamAStats.losses++;
      teamBStats.points += 3;
    } else {
      teamAStats.draws++;
      teamBStats.draws++;
      teamAStats.points += 1;
      teamBStats.points += 1;
    }
  }

  const standings = Array.from(standingsMap.values());

  standings.forEach(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  return standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}

function GroupStandings({ group, matchesForGroup, allTeams }: { group: TournamentGroup, matchesForGroup: Match[], allTeams: Record<string, Team> }) {
  const groupTeams = group.teams.map(tid => allTeams[tid]).filter(Boolean);
  const standings = calculateStandings(matchesForGroup, groupTeams);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] hidden sm:table-cell"></TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center hidden md:table-cell">GF</TableHead>
              <TableHead className="text-center hidden md:table-cell">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((s, index) => (
              <TableRow key={s.teamId}>
                <TableCell className="hidden sm:table-cell">{index + 1}</TableCell>
                <TableCell className="font-medium">{s.teamName}</TableCell>
                <TableCell className="text-center">{s.played}</TableCell>
                <TableCell className="text-center">{s.wins}</TableCell>
                <TableCell className="text-center">{s.draws}</TableCell>
                <TableCell className="text-center">{s.losses}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{s.goalsFor}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{s.goalsAgainst}</TableCell>
                <TableCell className="text-center">{s.goalDifference}</TableCell>
                <TableCell className="text-center font-bold">{s.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function TournamentsPage() {
  const { matches, teams, tournaments, isDataLoaded } = useAdminData();
  
  const sortedTournaments = useMemo(() => {
    return [...tournaments].sort((a, b) => a.name.localeCompare(b.name));
  }, [tournaments]);

  if (!isDataLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Tournaments</h1>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (sortedTournaments.length === 0) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8">
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">No Tournaments Available</h2>
                    <p className="mt-2 text-muted-foreground">
                        Tournaments will appear here once they are created by an administrator.
                    </p>
                </div>
            </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Tournaments</h1>

        <Tabs defaultValue={sortedTournaments[0].id} className="w-full">
            <TabsList>
                {sortedTournaments.map(tournament => (
                    <TabsTrigger key={tournament.id} value={tournament.id}>{tournament.name}</TabsTrigger>
                ))}
            </TabsList>
            {sortedTournaments.map(tournament => {
                const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id);

                return (
                <TabsContent key={tournament.id} value={tournament.id} className="space-y-8 mt-4">
                  {tournament.groups.map(group => {
                    const groupMatches = tournamentMatches.filter(m => m.groupId === group.id);
                    return (
                        <div key={group.id}>
                            <GroupStandings group={group} matchesForGroup={groupMatches} allTeams={teams} />
                        </div>
                    )
                  })}

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Matches</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tournamentMatches.length > 0 ? tournamentMatches.map(match => (
                            <MatchCard key={match.id} match={match} />
                        )) : <p className="text-muted-foreground col-span-full">No matches scheduled for this tournament yet.</p>}
                    </div>
                  </div>

                  {tournament.groups.length === 0 && (
                      <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <p>No groups have been set up for this tournament yet.</p>
                        </CardContent>
                      </Card>
                  )}
                </TabsContent>
                )
            })}
        </Tabs>
      </main>
    </div>
  );
}
