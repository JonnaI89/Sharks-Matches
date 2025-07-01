"use client"

import { useState, useEffect } from "react";
import type { Player } from "@/lib/types";
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

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roster: Player[];
  teamId: string;
  onAddGoal: (teamId: string, scorer: Player, assist?: Player) => void;
}

export function AddGoalDialog({ open, onOpenChange, roster, teamId, onAddGoal }: AddGoalDialogProps) {
  const [scorerId, setScorerId] = useState<string | undefined>();
  const [assistId, setAssistId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      setScorerId(undefined);
      setAssistId(undefined);
    }
  }, [open]);

  const handleSubmit = () => {
    if (teamId && scorerId) {
      const scorer = roster.find(p => p.id === scorerId);
      const assist = roster.find(p => p.id === assistId);
      if (scorer) {
        onAddGoal(teamId, scorer, assist);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Goal</DialogTitle>
          <DialogDescription>
            Select the scorer and optional assist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scorer" className="text-right">Scorer</Label>
            <Select onValueChange={setScorerId} value={scorerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {roster.map(player => (
                  <SelectItem key={player.id} value={player.id} disabled={player.isGoalie}>
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
                {roster.filter(p => p.id !== scorerId && !p.isGoalie).map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!scorerId}>Save goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
