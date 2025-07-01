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

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onAddMatch: (teamAId: string, teamBId: string) => void;
}

export function CreateMatchDialog({ open, onOpenChange, teams, onAddMatch }: CreateMatchDialogProps) {
  const [teamAId, setTeamAId] = useState<string | undefined>();
  const [teamBId, setTeamBId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setTeamAId(undefined);
      setTeamBId(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    setError(null);
    if (!teamAId || !teamBId) {
      setError("Please select both teams.");
      return;
    }
    if (teamAId === teamBId) {
      setError("Teams cannot play against themselves.");
      return;
    }
    onAddMatch(teamAId, teamBId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Select two teams to create a new match.
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
