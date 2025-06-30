"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { matches as mockMatches } from "@/lib/mock-data";
import type { Match, Player } from "@/lib/types";
import { Scoreboard } from "@/components/scoreboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Play, Pause, Square } from "lucide-react";
import { AddGoalDialog } from "@/components/admin/add-goal-dialog";
import { AddPenaltyDialog } from "@/components/admin/add-penalty-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function RosterTable({ teamName, players }: { teamName: string; players: Player[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">A</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.number}</TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-center">{p.stats.goals}</TableCell>
                                <TableCell className="text-center">{p.stats.assists}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function AdminMatchPage() {
  const params = useParams();
  const matchData = mockMatches.find((m) => m.id === params.id);

  const [match, setMatch] = useState<Match | null>(matchData || null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && match) {
      interval = setInterval(() => {
        setMatch(prevMatch => {
          if (!prevMatch) return null;
          const [minutes, seconds] = prevMatch.time.split(':').map(Number);
          let newSeconds = seconds - 1;
          let newMinutes = minutes;
          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes -= 1;
          }
          if (newMinutes < 0) {
            setIsRunning(false);
            return { ...prevMatch, time: "00:00" };
          }
          return {
            ...prevMatch,
            time: `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, match]);


  if (!match) {
    // In a real app, you'd fetch data here and show a loading state
    // For this mock, we'll just handle the not found case.
    useEffect(() => {
      if(!matchData) notFound();
    }, [matchData])
    return null;
  }
  
  const handleAddGoal = (teamId: string, scorer: Player, assist: Player | undefined) => {
    console.log("Adding goal:", { teamId, scorer, assist });
    // In a real app, this would update the backend.
    // Here we just log it.
  }
  
  const handleAddPenalty = (teamId: string, player: Player, duration: number) => {
    console.log("Adding penalty:", { teamId, player, duration });
  }

  return (
    <div className="space-y-8">
      <Scoreboard match={match} />
      
      <Card>
        <CardHeader>
          <CardTitle>Match Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="w-full" onClick={() => setIsRunning(prev => !prev)}>
            {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? "Pause Clock" : "Start Clock"}
          </Button>
          <AddGoalDialog
            rosterA={match.rosterA}
            rosterB={match.rosterB}
            onAddGoal={handleAddGoal}
            teamAId={match.teamA.id}
            teamBId={match.teamB.id}
          >
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </AddGoalDialog>
          <AddPenaltyDialog
             rosterA={match.rosterA}
             rosterB={match.rosterB}
             onAddPenalty={handleAddPenalty}
             teamAId={match.teamA.id}
             teamBId={match.teamB.id}
          >
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" /> Add Penalty
            </Button>
          </AddPenaltyDialog>
          <Button variant="destructive" className="w-full">
            <Square className="mr-2 h-4 w-4" /> End Period
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <RosterTable teamName={match.teamA.name} players={match.rosterA} />
        <RosterTable teamName={match.teamB.name} players={match.rosterB} />
      </div>
    </div>
  );
}
