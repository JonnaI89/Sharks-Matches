"use client";

import { useState, useEffect } from "react";
import type { Player, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  players: Player[];
  onAddMatch: (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number, breakDurationMinutes: number, goalieAId: string | null, goalieBId: string | null) => void;
}

export function CreateMatchDialog({ open, onOpenChange, teams, players, onAddMatch }: CreateMatchDialogProps) {
  const [teamAId, setTeamAId] = useState<string | undefined>();
  const [teamBId, setTeamBId] = useState<string | undefined>();
  const [goalieAId, setGoalieAId] = useState<string | undefined>();
  const [goalieBId, setGoalieBId] = useState<string | undefined>();
  const [totalPeriods, setTotalPeriods] = useState<string>("3");
  const [periodDuration, setPeriodDuration] = useState<string>("20");
  const [breakDuration, setBreakDuration] = useState<string>("15");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setTeamAId(undefined);
      setTeamBId(undefined);
      setGoalieAId(undefined);
      setGoalieBId(undefined);
      setTotalPeriods("3");
      setPeriodDuration("20");
      setBreakDuration("15");
    }
  }, [open]);

  const handleSubmit = () => {
    setError(null);
    const periods = parseInt(totalPeriods, 10);
    const duration = parseInt(periodDuration, 10);
    const breakDur = parseInt(breakDuration, 10);

    if (!teamAId || !teamBId) {
      setError("Please select both teams.");
      return;
    }
    if (teamAId === teamBId) {
      setError("Teams cannot play against themselves.");
      return;
    }
    if (isNaN(periods) || periods <= 0) {
      setError("Number of periods must be a positive number.");
      return;
    }
    if (isNaN(duration) || duration <= 0) {
      setError("Period duration must be a positive number.");
      return;
    }
    if (isNaN(breakDur) || breakDur < 0) {
      setError("Break duration must be a positive number.");
      return;
    }

    onAddMatch(teamAId, teamBId, periods, duration, breakDur, goalieAId || null, goalieBId || null);
    onOpenChange(false);
  };

  const teamAGoalies = teamAId ? players.filter(p => p.teamId === teamAId && p.isGoalie) : [];
  const teamBGoalies = teamBId ? players.filter(p => p.teamId === teamBId && p.isGoalie) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Select two teams and configure match settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamA" className="text-right">Home Team</Label>
            <Select onValueChange={(val) => { setTeamAId(val); setGoalieAId(undefined); }} value={teamAId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.filter(t => t.id !== teamBId).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamB" className="text-right">Away Team</Label>
            <Select onValueChange={(val) => { setTeamBId(val); setGoalieBId(undefined); }} value={teamBId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.filter(t => t.id !== teamAId).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalieA" className="text-right">Home Goalie</Label>
            <Select onValueChange={setGoalieAId} value={goalieAId} disabled={!teamAId || teamAGoalies.length === 0}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={!teamAId ? "Select team first" : (teamAGoalies.length === 0 ? "No goalies on roster" : "Select goalie")} />
              </SelectTrigger>
              <SelectContent>
                {teamAGoalies.map(goalie => (
                  <SelectItem key={goalie.id} value={goalie.id}>
                    #{goalie.number} {goalie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalieB" className="text-right">Away Goalie</Label>
            <Select onValueChange={setGoalieBId} value={goalieBId} disabled={!teamBId || teamBGoalies.length === 0}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={!teamBId ? "Select team first" : (teamBGoalies.length === 0 ? "No goalies on roster" : "Select goalie")} />
              </SelectTrigger>
              <SelectContent>
                {teamBGoalies.map(goalie => (
                  <SelectItem key={goalie.id} value={goalie.id}>
                    #{goalie.number} {goalie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="periods" className="text-right">Periods</Label>
            <Input
              id="periods"
              type="number"
              value={totalPeriods}
              onChange={(e) => setTotalPeriods(e.target.value)}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(e.target.value)}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakDuration" className="text-right">Break (min)</Label>
            <Input
              id="breakDuration"
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              className="col-span-3"
              min="0"
            />
          </div>
          {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!teamAId || !teamBId}>Create Match</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
