"use client"

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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddSaveDialogProps {
  children: React.ReactNode;
  teams: Team[];
  rosters: Record<string, Player[]>;
  onAddSave: (teamId: string, goalie: Player) => void;
  disabled?: boolean;
}

export function AddSaveDialog({ children, teams, rosters, onAddSave, disabled }: AddSaveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamId, setTeamId] = useState<string | undefined>();
  const [goalieId, setGoalieId] = useState<string | undefined>();

  const currentRoster = teamId ? rosters[teamId] : [];
  const goalies = currentRoster.filter(p => p.isGoalie);

  useEffect(() => {
    if (!isOpen) {
      setTeamId(undefined);
      setGoalieId(undefined);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (teamId && goalieId) {
      const goalie = goalies.find(p => p.id === goalieId);
      if (goalie) {
        onAddSave(teamId, goalie);
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Save</DialogTitle>
          <DialogDescription>
            Select the team and the goalie who made the save.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">Team</Label>
            <Select onValueChange={(val) => { setTeamId(val); setGoalieId(undefined); }} value={teamId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalie" className="text-right">Goalie</Label>
            <Select onValueChange={setGoalieId} value={goalieId} disabled={!teamId || goalies.length === 0}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={goalies.length === 0 ? "No goalies on roster" : "Select a goalie"} />
              </SelectTrigger>
              <SelectContent>
                {goalies.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!goalieId}>Register Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
