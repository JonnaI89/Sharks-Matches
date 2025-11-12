"use client";

import { useState, useMemo } from 'react';
import type { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  unassignedPlayers: Player[];
  onAssignPlayer: (teamId: string, playerId: string) => void;
}

export function AssignPlayerDialog({
  open,
  onOpenChange,
  teamId,
  unassignedPlayers,
  onAssignPlayer,
}: AssignPlayerDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedPlayerId) {
      onAssignPlayer(teamId, selectedPlayerId);
      setSelectedPlayerId(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Player to Team</DialogTitle>
          <DialogDescription>
            Select a player from the player bank to add to this team's roster.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search for player..." />
          <CommandList>
            <CommandEmpty>No players found.</CommandEmpty>
            <CommandGroup>
              {unassignedPlayers.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  onSelect={() => {
                    setSelectedPlayerId(player.id);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedPlayerId === player.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span>#{player.number} - {player.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedPlayerId}>
            Assign Player
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
