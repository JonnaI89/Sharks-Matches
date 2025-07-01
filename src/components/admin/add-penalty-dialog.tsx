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

interface AddPenaltyDialogProps {
  children: React.ReactNode;
  rosterA: Player[];
  rosterB: Player[];
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  disabled?: boolean;
  onAddPenalty: (teamId: string, player: Player, duration: number) => void;
}

export function AddPenaltyDialog({ children, rosterA, rosterB, teamAId, teamBId, teamAName, teamBName, disabled, onAddPenalty }: AddPenaltyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamId, setTeamId] = useState<string | undefined>();
  const [playerId, setPlayerId] = useState<string | undefined>();
  const [duration, setDuration] = useState<string | undefined>();

  const currentRoster = teamId === teamAId ? rosterA : (teamId === teamBId ? rosterB : []);

  const handleSubmit = () => {
    if (teamId && playerId && duration) {
      const player = currentRoster.find(p => p.id === playerId);
      if (player) {
        onAddPenalty(teamId, player, parseInt(duration, 10));
        setIsOpen(false);
        // Reset form
        setTeamId(undefined);
        setPlayerId(undefined);
        setDuration(undefined);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Penalty</DialogTitle>
          <DialogDescription>
            Select the team, player, and duration for the penalty.
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
                <SelectItem value={teamAId}>{teamAName}</SelectItem>
                <SelectItem value={teamBId}>{teamBName}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player" className="text-right">Player</Label>
            <Select onValueChange={setPlayerId} value={playerId} disabled={!teamId}>
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
            <Label htmlFor="duration" className="text-right">Duration</Label>
            <Select onValueChange={setDuration} value={duration} disabled={!playerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Minutes</SelectItem>
                <SelectItem value="5">5 Minutes</SelectItem>
                <SelectItem value="10">10 Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!duration}>Save penalty</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
