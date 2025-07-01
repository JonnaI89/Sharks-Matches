"use client";

import { useState } from "react";
import { teams as initialTeams, players as initialPlayers } from "@/lib/mock-data";
import type { Player, Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddPlayerDialog } from "@/components/admin/add-player-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RosterManagementPage() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [teams] = useState<Record<string, Team>>(initialTeams);
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleAddPlayerClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsAddPlayerDialogOpen(true);
  };

  const handleAddPlayer = (teamId: string, newPlayer: Omit<Player, 'id' | 'teamId' | 'stats'>) => {
    setPlayers(prev => [
      ...prev,
      {
        ...newPlayer,
        id: `p${Date.now()}`,
        teamId: teamId,
        stats: { goals: 0, assists: 0, penalties: 0 },
      },
    ]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Roster Management</h1>
        <p className="text-muted-foreground">Add, edit, or remove players from each team.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {Object.values(teams).map(team => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>Manage the player roster for the {team.name}.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleAddPlayerClick(team.id)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Player
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.filter(p => p.teamId === team.id).length > 0 ? (
                    players.filter(p => p.teamId === team.id).map(player => (
                      <TableRow key={player.id}>
                        <TableCell>{player.number}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          {player.isGoalie && <Badge variant="outline">Goalie</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove Player</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {player.name} from the roster.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemovePlayer(player.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No players on this roster yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
      <AddPlayerDialog
        open={isAddPlayerDialogOpen}
        onOpenChange={setIsAddPlayerDialogOpen}
        teamId={selectedTeamId}
        onAddPlayer={handleAddPlayer}
      />
    </div>
  );
}
