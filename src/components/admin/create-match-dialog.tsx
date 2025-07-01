"use client";

import { useState, useEffect } from "react";
import type { Team } from "@/lib/types";
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
  onAddMatch: (teamAId: string, teamBId: string, totalPeriods: number, periodDurationMinutes: number) => void;
}

export function CreateMatchDialog({ open, onOpenChange, teams, onAddMatch }: CreateMatchDialogProps) {
  const [teamAId, setTeamAId] = useState<string | undefined>();
  const [teamBId, setTeamBId] = useState<string | undefined>();
  const [totalPeriods, setTotalPeriods] = useState<string>("3");
  const [periodDuration, setPeriodDuration] = useState<string>("20");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setTeamAId(undefined);
      setTeamBId(undefined);
      setTotalPeriods("3");
      setPeriodDuration("20");
    }
  }, [open]);

  const handleSubmit = () => {
    setError(null);
    const periods = parseInt(totalPeriods, 10);
    const duration = parseInt(periodDuration, 10);

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

    onAddMatch(teamAId, teamBId, periods, duration);
    onOpenChange(false);
  };

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
            <Select onValueChange={setTeamAId} value={teamAId}>
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
            <Select onValueChange={setTeamBId} value={teamBId}>
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
