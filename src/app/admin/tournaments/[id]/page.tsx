"use client";

import { useState, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useAdminData } from '@/context/admin-data-context';
import type { Tournament, TournamentGroup, Team } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, ArrowLeft, X } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tournaments, teams, updateTournament, isDataLoaded } = useAdminData();
  const tournament = tournaments.find(t => t.id === params.id);

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<Record<string, string>>({});

  const teamsArray = useMemo(() => Object.values(teams), [teams]);

  const handleAddGroup = async () => {
    if (!tournament || !newGroupName.trim()) return;
    const newGroup: TournamentGroup = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      teams: [],
    };
    const updatedTournament = {
      ...tournament,
      groups: [...tournament.groups, newGroup],
    };
    await updateTournament(updatedTournament);
    setNewGroupName("");
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!tournament) return;
    const updatedTournament = {
      ...tournament,
      groups: tournament.groups.filter(g => g.id !== groupId),
    };
    await updateTournament(updatedTournament);
  };

  const handleAddTeamToGroup = async (groupId: string) => {
    const selectedTeamId = selectedTeamIds[groupId];
    if (!tournament || !selectedTeamId) return;
    const updatedGroups = tournament.groups.map(g => {
      if (g.id === groupId) {
        if (g.teams.includes(selectedTeamId)) return g;
        return { ...g, teams: [...g.teams, selectedTeamId] };
      }
      return g;
    });
    await updateTournament({ ...tournament, groups: updatedGroups });
    setSelectedTeamIds(prev => ({...prev, [groupId]: ""}));
  };

  const handleRemoveTeamFromGroup = async (groupId: string, teamIdToRemove: string) => {
    if (!tournament) return;
    const updatedGroups = tournament.groups.map(g => {
      if (g.id === groupId) {
        return { ...g, teams: g.teams.filter(tid => tid !== teamIdToRemove) };
      }
      return g;
    });
    await updateTournament({ ...tournament, groups: updatedGroups });
  };

  const handleSelectedTeamChange = (groupId: string, teamId: string) => {
    setSelectedTeamIds(prev => ({...prev, [groupId]: teamId}));
  };

  const getTeamName = (teamId: string) => teams[teamId]?.name || 'Unknown Team';
  
  const unassignedTeams = useMemo(() => {
    if (!tournament) return [];
    const assignedTeamIds = new Set(tournament.groups.flatMap(g => g.teams));
    return teamsArray.filter(t => !assignedTeamIds.has(t.id));
  }, [tournament, teamsArray]);

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!tournament) {
    return notFound();
  }
  
  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/admin/tournaments')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tournaments
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{tournament.name}</CardTitle>
          <CardDescription>Manage groups and teams for this tournament.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournament.groups.map(group => (
          <Card key={group.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{group.name}</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete group "{group.name}"? Teams will become unassigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {group.teams.map(teamId => (
                  <li key={teamId} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <span>{getTeamName(teamId)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTeamFromGroup(group.id, teamId)}>
                        <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
                {group.teams.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No teams in this group yet.</p>
                )}
              </ul>
              <div className="flex gap-2">
                <Select 
                  onValueChange={(teamId) => handleSelectedTeamChange(group.id, teamId)} 
                  value={selectedTeamIds[group.id] || ""}
                >
                  <SelectTrigger><SelectValue placeholder="Add a team..." /></SelectTrigger>
                  <SelectContent>
                    {unassignedTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleAddTeamToGroup(group.id)} disabled={!selectedTeamIds[group.id]}>Add</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-2 border-dashed">
            <CardHeader>
                <CardTitle>Create New Group</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Input 
                    placeholder="Group Name" 
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)}
                />
                <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
