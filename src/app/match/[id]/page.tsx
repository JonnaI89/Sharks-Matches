"use client";

import { useState, useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import { useAdminData } from "@/context/admin-data-context";
import { Header } from "@/components/header";
import { EventTimeline } from "@/components/event-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RosterTable } from "@/components/roster-table";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { useLiveMatch } from "@/hooks/use-live-match";
import { Scoreboard } from "@/components/scoreboard";
import { ActivePenalties } from "@/components/active-penalties";

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const { matches, isDataLoaded } = useAdminData();
  const [rostersVisible, setRostersVisible] = useState(false);
  
  const match = useMemo(() => matches.find((m) => m.id === params.id), [matches, params.id]);
  const liveMatch = useLiveMatch(match);

  if (!isDataLoaded) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <div className="sticky top-16 bg-background z-40 shadow-sm border-b">
                <div className="container mx-auto px-4 md:px-8 py-4">
                    <Scoreboard match={undefined} />
                </div>
            </div>
            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
    );
  }
  
  if (!match || !liveMatch) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="sticky top-16 bg-background z-40 shadow-sm border-b">
        <div className="container mx-auto px-4 md:px-8 py-4">
            <Scoreboard match={liveMatch} />
        </div>
      </div>

      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <ActivePenalties match={liveMatch} />
        
        <Card>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTimeline match={match} />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="text-center">
            <Button variant="outline" onClick={() => setRostersVisible(!rostersVisible)} className="w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" />
              {rostersVisible ? "Skjul lagoppstillinger" : "Vis lagoppstillinger"}
              {rostersVisible ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {rostersVisible && (
            <div className="grid md:grid-cols-2 gap-8">
                <RosterTable teamName={match.teamA.name} players={match.rosterA} />
                <RosterTable teamName={match.teamB.name} players={match.rosterB} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
