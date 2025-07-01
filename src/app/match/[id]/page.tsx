"use client";

import { useParams, notFound } from "next/navigation";
import { useAdminData } from "@/context/admin-data-context";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTimeline } from "@/components/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Player } from "@/lib/types";
import { KeyMoments } from "@/components/key-moments";
import { LiveMatchWrapper } from "@/components/live-match-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

function StatsTable({ players }: { players: Player[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-center">G</TableHead>
          <TableHead className="text-center">A</TableHead>
          <TableHead className="text-center">PIM</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell>{player.number}</TableCell>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell className="text-center">{player.stats.goals}</TableCell>
            <TableCell className="text-center">{player.stats.assists}</TableCell>
            <TableCell className="text-center">{player.stats.penalties}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const { matches, isDataLoaded } = useAdminData();
  
  if (!isDataLoaded) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
    );
  }
  
  const match = matches.find((m) => m.id === params.id);

  if (!match) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <LiveMatchWrapper match={match} />
        
        <Card>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTimeline match={match} />
          </CardContent>
        </Card>
        
        <Tabs defaultValue="stats" className="pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{match.teamA.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatsTable players={match.rosterA} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{match.teamB.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatsTable players={match.rosterB} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analysis">
             <KeyMoments match={match} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
