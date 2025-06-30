"use client"

import { useState } from "react";
import type { Player } from "@/lib/types";
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

interface AddGoalDialogProps {
  children: React.ReactNode;
  rosterA: Player[];
  rosterB: Player[];
  teamAId: string;
  teamBId: string;
  onAddGoal: (teamId: string, scorer: Player, assist: Player | undefined) => void;
}

export function AddGoalDialog({ children, rosterA, rosterB, teamAId, teamBId, onAddGoal }: AddGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamId, setTeamId] = useState<string | undefined>();
  const [scorerId, setScorerId] = useState<string | undefined>();
  const [assistId, setAssistId] = useState<string | undefined>();

  const currentRoster = teamId === teamAId ? rosterA : (teamId === teamBId ? rosterB : []);

  const handleSubmit = () => {
    if (teamId && scorerId) {
      const scorer = currentRoster.find(p => p.id === scorerId);
      const assist = currentRoster.find(p => p.id === assistId);
      if (scorer) {
        onAddGoal(teamId, scorer, assist);
        setIsOpen(false);
        // Reset form
        setTeamId(undefined);
        setScorerId(undefined);
        setAssistId(undefined);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Goal</DialogTitle>
          <DialogDescription>
            Select the team, scorer, and optional assist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">Team</Label>
            <Select onValueChange={setTeamId} value={teamId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={teamAId}>{rosterA[0]?.name.split(" ")[0]} Team</SelectItem>
                <SelectItem value={teamBId}>{rosterB[0]?.name.split(" ")[0]} Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scorer" className="text-right">Scorer</Label>
            <Select onValueChange={setScorerId} value={scorerId} disabled={!teamId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {currentRoster.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assist" className="text-right">Assist</Label>
            <Select onValueChange={setAssistId} value={assistId} disabled={!scorerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a player (optional)" />
              </SelectTrigger>
              <SelectContent>
                {currentRoster.filter(p => p.id !== scorerId).map(player => (
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
          <Button type="submit" onClick={handleSubmit} disabled={!scorerId}>Save goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
