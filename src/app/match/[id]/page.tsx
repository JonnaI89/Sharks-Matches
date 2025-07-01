"use client";

import { useParams, notFound } from "next/navigation";
import { useAdminData } from "@/context/admin-data-context";
import { Header } from "@/components/header";
import { EventTimeline } from "@/components/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveMatchWrapper } from "@/components/live-match-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { RosterTable } from "@/components/roster-table";

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const { matches, isDataLoaded } = useAdminData();
  
  if (!isDataLoaded) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
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
        
        <div className="grid md:grid-cols-2 gap-8">
            <RosterTable teamName={match.teamA.name} players={match.rosterA} />
            <RosterTable teamName={match.teamB.name} players={match.rosterB} />
        </div>
      </main>
    </div>
  );
}
