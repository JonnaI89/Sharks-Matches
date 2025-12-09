"use client";

import { useState, useEffect } from "react";
import type { Player, Team, Tournament } from "@/lib/types";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  players: Player[];
  tournaments: Tournament[];
  onAddMatch: (data: {
    teamAId: string;
    teamBId: string;
    totalPeriods: number;
    periodDurationMinutes: number;
    breakDurationMinutes: number;
    goalieAId: string | null;
    goalieBId: string | null;
    tournamentId?: string;
    groupId?: string;
    date?: string;
  }) => void;
}

export function CreateMatchDialog({ open, onOpenChange, teams, players, tournaments, onAddMatch }: CreateMatchDialogProps) {
  const [teamAId, setTeamAId] = useState<string | undefined>();
  const [teamBId, setTeamBId] = useState<string | undefined>();
  const [goalieAId, setGoalieAId] = useState<string | undefined>();
  const [goalieBId, setGoalieBId] = useState<string | undefined>();
  const [tournamentId, setTournamentId] = useState<string | undefined>();
  const [groupId, setGroupId] = useState<string | undefined>();
  const [totalPeriods, setTotalPeriods] = useState<string>("3");
  const [periodDuration, setPeriodDuration] = useState<string>("20");
  const [breakDuration, setBreakDuration] = useState<string>("15");
  const [date, setDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);

  const selectedTournament = tournaments.find(t => t.id === tournamentId);

  useEffect(() => {
    if (!open) {
      setError(null);
      setTeamAId(undefined);
      setTeamBId(undefined);
      setGoalieAId(undefined);
      setGoalieBId(undefined);
      setTournamentId(undefined);
      setGroupId(undefined);
      setTotalPeriods("3");
      setPeriodDuration("20");
      setBreakDuration("15");
      setDate(undefined);
    }
  }, [open]);

  useEffect(() => {
    // If teams are not in the selected group, reset them
    if (selectedTournament && groupId) {
        const group = selectedTournament.groups.find(g => g.id === groupId);
        if (group) {
            if (teamAId && !group.teams.includes(teamAId)) setTeamAId(undefined);
            if (teamBId && !group.teams.includes(teamBId)) setTeamBId(undefined);
        } else {
            setGroupId(undefined);
        }
    }
  }, [groupId, selectedTournament, teamAId, teamBId]);

  const handleSubmit = () => {
    setError(null);
    const periods = parseInt(totalPeriods, 10);
    const duration = parseInt(periodDuration, 10);
    const breakDur = parseInt(breakDuration, 10);

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
    if (isNaN(breakDur) || breakDur < 0) {
      setError("Break duration must be a positive number.");
      return;
    }

    onAddMatch({
        teamAId, teamBId, 
        totalPeriods: periods, periodDurationMinutes: duration, breakDurationMinutes: breakDur, 
        goalieAId: goalieAId || null, goalieBId: goalieBId || null,
        tournamentId, groupId,
        date: date ? date.toISOString() : undefined,
    });
    onOpenChange(false);
  };

  const teamAGoalies = teamAId ? players.filter(p => p.teamId === teamAId && p.isGoalie) : [];
  const teamBGoalies = teamBId ? players.filter(p => p.teamId === teamBId && p.isGoalie) : [];
  
  let availableTeams = teams;
  if(selectedTournament && groupId) {
    const group = selectedTournament.groups.find(g => g.id === groupId);
    if (group) {
      availableTeams = teams.filter(t => group.teams.includes(t.id));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Select two teams and configure match settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tournament" className="text-right">Tournament</Label>
            <Select onValueChange={(val) => { setTournamentId(val); setGroupId(undefined); setTeamAId(undefined); setTeamBId(undefined); }} value={tournamentId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a tournament (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Tournament</SelectItem>
                {tournaments.map(tourn => (
                  <SelectItem key={tourn.id} value={tourn.id}>
                    {tourn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tournamentId && tournamentId !== 'none' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">Group</Label>
              <Select onValueChange={(val) => { setGroupId(val); setTeamAId(undefined); setTeamBId(undefined); }} value={groupId} disabled={!selectedTournament}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTournament?.groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamA" className="text-right">Home Team</Label>
            <Select onValueChange={(val) => { setTeamAId(val); setGoalieAId(undefined); }} value={teamAId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.filter(t => t.id !== teamBId).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamB" className="text-right">Away Team</Label>
            <Select onValueChange={(val) => { setTeamBId(val); setGoalieBId(undefined); }} value={teamBId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.filter(t => t.id !== teamAId).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalieA" className="text-right">Home Goalie</Label>
            <Select onValueChange={setGoalieAId} value={goalieAId} disabled={!teamAId || teamAGoalies.length === 0}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={!teamAId ? "Select team first" : (teamAGoalies.length === 0 ? "No goalies on roster" : "Select goalie")} />
              </SelectTrigger>
              <SelectContent>
                {teamAGoalies.map(goalie => (
                  <SelectItem key={goalie.id} value={goalie.id}>
                    #{goalie.number} {goalie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalieB" className="text-right">Away Goalie</Label>
            <Select onValueChange={setGoalieBId} value={goalieBId} disabled={!teamBId || teamBGoalies.length === 0}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={!teamBId ? "Select team first" : (teamBGoalies.length === 0 ? "No goalies on roster" : "Select goalie")} />
              </SelectTrigger>
              <SelectContent>
                {teamBGoalies.map(goalie => (
                  <SelectItem key={goalie.id} value={goalie.id}>
                    #{goalie.number} {goalie.name}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breakDuration" className="text-right">Break (min)</Label>
            <Input
              id="breakDuration"
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              className="col-span-3"
              min="0"
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
