import { Header } from "@/components/header";
import { matches } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTimeline } from "@/components/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Player } from "@/lib/types";
import { KeyMoments } from "@/components/key-moments";
import { LiveMatchWrapper } from "@/components/live-match-wrapper";

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

export default function MatchPage({ params }: { params: { id: string } }) {
  const match = matches.find((m) => m.id === params.id);

  if (!match) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Tabs defaultValue="summary" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <LiveMatchWrapper match={match} />
          </TabsContent>
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <EventTimeline events={match.events} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-8">
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
