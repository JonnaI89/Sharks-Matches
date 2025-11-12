"use client";

import { useState, useMemo } from "react";
import { useAdminData } from "@/context/admin-data-context";
import type { Player, Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, UserPlus, UserMinus, Users, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddPlayerDialog } from "@/components/admin/add-player-dialog";
import { AddTeamDialog } from "@/components/admin/add-team-dialog";
import { EditTeamDialog } from "@/components/admin/edit-team-dialog";
import { AssignPlayerDialog } from "@/components/admin/assign-player-dialog";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";


export default function RosterManagementPage() {
  const { players, teams, addPlayer, deletePlayer, updatePlayer, addTeam, deleteTeam, updateTeam } = useAdminData();
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [isAssignPlayerDialogOpen, setIsAssignPlayerDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isPlayerBankOpen, setIsPlayerBankOpen] = useState(false);

  const unassignedPlayers = useMemo(() => players.filter(p => !p.teamId), [players]);

  const handleAddPlayerClick = (teamId: string | null) => {
    setSelectedTeamId(teamId);
    setIsAddPlayerDialogOpen(true);
  };

  const handleAssignPlayerClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsAssignPlayerDialogOpen(true);
  };

  const handleEditTeamClick = (team: Team) => {
    setTeamToEdit(team);
    setIsEditTeamDialogOpen(true);
  };

  const handleAddPlayer = async (teamId: string | null, newPlayer: Omit<Player, 'id' | 'teamId' | 'stats'>) => {
    await addPlayer(teamId, newPlayer);
  };

  const handleRemovePlayer = async (playerId: string) => {
    await deletePlayer(playerId);
  };

  const handleUnassignPlayer = async (playerId: string) => {
    await updatePlayer(playerId, { teamId: null });
  };
  
  const handleAssignPlayer = async (teamId: string, playerId: string) => {
    await updatePlayer(playerId, { teamId: teamId });
  };

  const handleAddTeam = async (newTeam: Omit<Team, 'id'>) => {
    await addTeam(newTeam);
  };
  
  const handleRemoveTeam = async (teamId: string) => {
    await deleteTeam(teamId);
  };

  const handleUpdateTeam = async (teamId: string, updatedData: Omit<Team, 'id'>) => {
    await updateTeam(teamId, updatedData);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Roster Management</h1>
          <p className="text-muted-foreground">Create teams and manage their players.</p>
        </div>
        <Button onClick={() => setIsAddTeamDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      <Collapsible open={isPlayerBankOpen} onOpenChange={setIsPlayerBankOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className='text-left'>
                <CardTitle className="flex items-center gap-2">
                  <Users /> Player Bank
                </CardTitle>
                <CardDescription>Players who are not currently assigned to a team. Add new players here or assign them to a team.</CardDescription>
              </div>
              <ChevronDown className={cn("h-6 w-6 transform transition-transform", isPlayerBankOpen && "rotate-180")} />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <Button size="sm" onClick={() => handleAddPlayerClick(null)} className="mb-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Player to Bank
                </Button>
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
                  {unassignedPlayers.length > 0 ? (
                    unassignedPlayers.map(player => (
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
                                    This will permanently delete {player.name} from the player bank.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemovePlayer(player.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        Player bank is empty.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {Object.values(teams).map(team => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>Manage the player roster for the {team.name}.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Button size="sm" variant="outline" onClick={() => handleAssignPlayerClick(team.id)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Assign Player
                </Button>
                <Button size="sm" onClick={() => handleAddPlayerClick(team.id)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Player
                </Button>
              </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                 <Button size="sm" variant="outline" onClick={() => handleEditTeamClick(team)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Team
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the team, its players and all associated match data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveTeam(team.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
                                <UserMinus className="h-4 w-4" />
                                <span className="sr-only">Unassign Player</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unassign {player.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the player from the team and return them to the player bank.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUnassignPlayer(player.id)}>
                                  Unassign
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
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
      <AddTeamDialog
        open={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        onAddTeam={handleAddTeam}
      />
      <EditTeamDialog
        open={isEditTeamDialogOpen}
        onOpenChange={setIsEditTeamDialogOpen}
        team={teamToEdit}
        onUpdateTeam={handleUpdateTeam}
      />
      <AssignPlayerDialog
        open={isAssignPlayerDialogOpen}
        onOpenChange={setIsAssignPlayerDialogOpen}
        teamId={selectedTeamId || ''}
        unassignedPlayers={unassignedPlayers}
        onAssignPlayer={handleAssignPlayer}
      />
    </div>
  );
}
