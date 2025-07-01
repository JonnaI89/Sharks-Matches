"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useParams } from "next/navigation";
import { useAdminData } from "@/context/admin-data-context";
import type { Match, Player, GoalEvent, PenaltyEvent, MatchEvent, SaveEvent } from "@/lib/types";
import { Scoreboard } from "@/components/scoreboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Play, Pause, Square, MinusCircle, Hand } from "lucide-react";
import { AddGoalDialog } from "@/components/admin/add-goal-dialog";
import { AddPenaltyDialog } from "@/components/admin/add-penalty-dialog";
import { AddSaveDialog } from "@/components/admin/add-save-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyMoments } from "@/components/key-moments";
import { RosterTable } from "@/components/roster-table";

const timeToSeconds = (time: string) => {
    if (!time) return 0;
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
};

const secondsToTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function AdminMatchPage() {
  const params = useParams();
  const { matches, teams, updateMatch, isDataLoaded } = useAdminData();
  const match = matches.find((m) => m.id === params.id);

  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState("00:00");
  const [editableMinutes, setEditableMinutes] = useState("00");
  const [editableSeconds, setEditableSeconds] = useState("00");
  const [editablePeriod, setEditablePeriod] = useState("1");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [goalDialogTeam, setGoalDialogTeam] = useState<string | null>(null);

  useEffect(() => {
    if (match) {
        setDisplayTime(match.time);
        const [m, s] = match.time.split(':');
        setEditableMinutes(m);
        setEditableSeconds(s);
        setEditablePeriod(String(match.period));
        setIsRunning(match.status === 'live');
    }
  }, [match]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && match) {
      interval = setInterval(() => {
        setDisplayTime(prevTime => {
            const currentTimeInSeconds = timeToSeconds(prevTime);
            const periodDurationInSeconds = match.periodDurationMinutes * 60;

            if (currentTimeInSeconds >= periodDurationInSeconds) {
                setIsRunning(false); 
                return secondsToTime(periodDurationInSeconds);
            }
            return secondsToTime(currentTimeInSeconds + 1);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, match]);

  const handleToggleClock = async () => {
    if (!match || match.status === 'finished') return;

    let newMatch = JSON.parse(JSON.stringify(match));
    
    switch(newMatch.status) {
        case 'live':
            newMatch.status = 'paused';
            newMatch.time = displayTime; // Capture current time
            break;
        case 'paused':
        case 'upcoming':
            newMatch.status = 'live';
            break;
        case 'break':
            newMatch.status = 'live';
            newMatch.breakEndTime = null;
            newMatch.time = '00:00'; // Start of period
            break;
    }
    
    await updateMatch(newMatch);
  };
  
  if (!isDataLoaded) {
      return (
        <div className="space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
      );
  }

  if (!match) {
    return notFound();
  }
  
  const handleAddGoalClick = (teamId: string) => {
    setGoalDialogTeam(teamId);
    setIsGoalDialogOpen(true);
  };

  const handleAddGoal = async (teamId: string, scorer: Player, assist: Player | undefined) => {
    if (!match) return;
    let newMatch = JSON.parse(JSON.stringify(match));
    newMatch.time = displayTime;

    const newGoalEvent: GoalEvent = {
        id: `e${newMatch.events.length + 1}`, type: 'goal', teamId, scorer, assist, time: newMatch.time, period: newMatch.period,
    };
    newMatch.events.push(newGoalEvent);

    if (teamId === newMatch.teamA.id) newMatch.scoreA += 1;
    else newMatch.scoreB += 1;

    const concedingTeamId = teamId === newMatch.teamA.id ? newMatch.teamB.id : newMatch.teamA.id;
    const activePenalties = newMatch.events.filter((e: MatchEvent): e is PenaltyEvent => e.type === 'penalty' && e.teamId === concedingTeamId && e.status === 'active');
    if (activePenalties.length > 0) {
      activePenalties.sort((a, b) => a.period !== b.period ? a.period - b.period : a.time.localeCompare(b.time));
      const penaltyToCancelId = activePenalties[0].id;
      const penaltyIndex = newMatch.events.findIndex((e: MatchEvent) => e.id === penaltyToCancelId);
      if (penaltyIndex > -1) (newMatch.events[penaltyIndex] as PenaltyEvent).status = 'cancelled';
    }

    await updateMatch(newMatch);
  };

  const handleAddSave = async (teamId: string, goalie: Player) => {
    if (!match) return;
    let newMatch = JSON.parse(JSON.stringify(match));
    newMatch.time = displayTime;

    const newSaveEvent: SaveEvent = {
        id: `e${newMatch.events.length + 1}`, type: 'save', teamId, goalie, time: newMatch.time, period: newMatch.period,
    };
    newMatch.events.push(newSaveEvent);
    
    await updateMatch(newMatch);
  };
  
  const handleAddPenalty = async (teamId: string, player: Player, duration: number) => {
    if (!match) return;
    let newMatch = JSON.parse(JSON.stringify(match));
    newMatch.time = displayTime;
    const periodDurationInSeconds = newMatch.periodDurationMinutes * 60;
    const currentTimeInSeconds = timeToSeconds(newMatch.time);
    const penaltyEndTimeInSeconds = currentTimeInSeconds + duration * 60;
    
    let endPeriod = newMatch.period;
    let endTimeInSecondsForPeriod = penaltyEndTimeInSeconds;
    
    while (endTimeInSecondsForPeriod >= periodDurationInSeconds) {
        endTimeInSecondsForPeriod -= periodDurationInSeconds;
        endPeriod++;
    }

    const newPenaltyEvent: PenaltyEvent = {
        id: `e${newMatch.events.length + 1}`, type: 'penalty', teamId, player, duration, time: newMatch.time, period: newMatch.period, status: 'active', expiresAt: { period: endPeriod, time: secondsToTime(endTimeInSecondsForPeriod) },
    };
    newMatch.events.push(newPenaltyEvent);
    
    await updateMatch(newMatch);
  };

  const handleRemoveLastGoal = async (teamId: string) => {
    if (!match) return;
    let newMatch = JSON.parse(JSON.stringify(match));
    let lastGoalIndex = -1;
    for (let i = newMatch.events.length - 1; i >= 0; i--) {
        if (newMatch.events[i].type === 'goal' && newMatch.events[i].teamId === teamId) {
            lastGoalIndex = i;
            break;
        }
    }
    if (lastGoalIndex === -1) return;

    if (teamId === newMatch.teamA.id) newMatch.scoreA = Math.max(0, newMatch.scoreA - 1);
    else newMatch.scoreB = Math.max(0, newMatch.scoreB - 1);
    
    newMatch.events.splice(lastGoalIndex, 1);
    await updateMatch(newMatch);
  };
  
  const handleRemoveLastPenalty = async () => {
    if (!match) return;
    let newMatch = JSON.parse(JSON.stringify(match));
    let lastPenaltyIndex = -1;
    for (let i = newMatch.events.length - 1; i >= 0; i--) {
        if (newMatch.events[i].type === 'penalty') { lastPenaltyIndex = i; break; }
    }
    if (lastPenaltyIndex === -1) return;
    
    newMatch.events.splice(lastPenaltyIndex, 1);
    await updateMatch(newMatch);
  };

  const handleTimeUpdate = async () => {
    if (!match || match.status === 'break') return;
    let newMinutes = parseInt(editableMinutes, 10);
    let newSeconds = parseInt(editableSeconds, 10);
    let newPeriod = parseInt(editablePeriod, 10);
    if (isNaN(newMinutes) || newMinutes < 0) newMinutes = 0;
    if (newMinutes > match.periodDurationMinutes) newMinutes = match.periodDurationMinutes;
    if (isNaN(newSeconds) || newSeconds < 0 || newSeconds > 59) newSeconds = 0;
    if (isNaN(newPeriod) || newPeriod < 1) newPeriod = 1;
    if (newMinutes === match.periodDurationMinutes) newSeconds = 0;
    
    await updateMatch({ ...match, time: `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`, period: newPeriod });
  };
  
  const handleEndPeriod = async () => {
    if (!match) return;
    setIsRunning(false);
    let newMatch = JSON.parse(JSON.stringify(match));
    if (newMatch.status === 'finished' || newMatch.status === 'break') return;

    if (newMatch.period >= newMatch.totalPeriods) {
        newMatch.events = newMatch.events.map((e: MatchEvent) => {
            if (e.type === 'penalty' && e.status === 'active') return { ...e, status: 'expired' };
            return e;
        });
        newMatch.time = secondsToTime(newMatch.periodDurationMinutes * 60);
        newMatch.status = 'finished';
    } else {
        newMatch.status = 'break';
        newMatch.breakEndTime = Date.now() + (newMatch.breakDurationMinutes || 15) * 60 * 1000;
        newMatch.period += 1;
        newMatch.time = "00:00";
    }
    await updateMatch(newMatch);
  };

  const clockButtonText = () => {
    if (match.status === 'live') return "Pause Clock";
    if (match.status === 'break') return "Start Period";
    return "Start Clock";
  };


  return (
    <div className="space-y-8">
      <Scoreboard match={{...match, time: displayTime}} />
      
      <Card>
        <CardHeader>
          <CardTitle>Match Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Clock & Period</h3>
                <div className="flex flex-wrap items-end gap-4">
                    <Button variant="outline" size="lg" onClick={handleToggleClock} className="w-40" disabled={match.status === 'finished'}>
                        {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                        {clockButtonText()}
                    </Button>
                    <div className="grid gap-1.5">
                        <Label>Time (MM:SS)</Label>
                        <div className="flex items-center gap-1">
                            <Input type="number" value={editableMinutes} onChange={(e) => setEditableMinutes(e.target.value)} className="w-16" disabled={isRunning || match.status === 'break'} max={match.periodDurationMinutes} min={0}/>
                            <span className="font-bold">:</span>
                            <Input type="number" value={editableSeconds} onChange={(e) => setEditableSeconds(e.target.value)} className="w-16" disabled={isRunning || match.status === 'break'} max={59} min={0}/>
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="period">Period</Label>
                        <Input id="period" type="number" value={editablePeriod} onChange={(e) => setEditablePeriod(e.target.value)} className="w-16" disabled={isRunning || match.status === 'break'} max={match.totalPeriods} min={1}/>
                    </div>
                    <Button onClick={handleTimeUpdate} disabled={isRunning || match.status === 'break'}>Set</Button>
                     <Button variant="destructive" onClick={handleEndPeriod} disabled={isRunning || match.status === 'finished' || match.status === 'break'}>
                        <Square className="mr-2 h-4 w-4" /> {match.period >= match.totalPeriods ? 'End Match' : 'End Period'}
                    </Button>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                    <h3 className="font-medium mb-2">{match.teamA.name}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full" onClick={() => handleAddGoalClick(match.teamA.id)} disabled={isRunning}>
                            <PlusCircle className="mr-2" /> Add Goal
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => handleRemoveLastGoal(match.teamA.id)} disabled={isRunning}>
                            <MinusCircle className="mr-2" /> Remove Goal
                        </Button>
                    </div>
                </div>
                 <div className="p-4 border rounded-lg space-y-2">
                    <h3 className="font-medium mb-2">{match.teamB.name}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full" onClick={() => handleAddGoalClick(match.teamB.id)} disabled={isRunning}>
                            <PlusCircle className="mr-2" /> Add Goal
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => handleRemoveLastGoal(match.teamB.id)} disabled={isRunning}>
                            <MinusCircle className="mr-2" /> Remove Goal
                        </Button>
                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                    <h3 className="font-medium mb-2">Penalty</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                         <AddPenaltyDialog
                            rosterA={match.rosterA}
                            rosterB={match.rosterB}
                            onAddPenalty={handleAddPenalty}
                            teamAId={match.teamA.id}
                            teamBId={match.teamB.id}
                            teamAName={match.teamA.name}
                            teamBName={match.teamB.name}
                            disabled={isRunning}
                        >
                            <Button variant="outline" className="w-full" disabled={isRunning}>
                                <Shield className="mr-2 h-4 w-4" /> Add Penalty
                            </Button>
                        </AddPenaltyDialog>
                        <Button variant="outline" className="w-full" onClick={handleRemoveLastPenalty} disabled={isRunning}>
                            <MinusCircle className="mr-2" /> Remove Penalty
                        </Button>
                    </div>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                    <h3 className="font-medium mb-2">Goalkeeping</h3>
                     <AddSaveDialog
                        teams={[match.teamA, match.teamB]}
                        rosters={{ [match.teamA.id]: match.rosterA, [match.teamB.id]: match.rosterB }}
                        onAddSave={handleAddSave}
                        disabled={isRunning}
                    >
                        <Button variant="outline" className="w-full" disabled={isRunning}>
                            <Hand className="mr-2 h-4 w-4" /> Register Save
                        </Button>
                    </AddSaveDialog>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <RosterTable teamName={match.teamA.name} players={match.rosterA} />
        <RosterTable teamName={match.teamB.name} players={match.rosterB} />
      </div>

      <KeyMoments match={match} />

      <AddGoalDialog
        open={isGoalDialogOpen}
        onOpenChange={setIsGoalDialogOpen}
        roster={goalDialogTeam === match.teamA.id ? match.rosterA : (goalDialogTeam === match.teamB.id ? match.rosterB : [])}
        teamId={goalDialogTeam || ''}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
}
