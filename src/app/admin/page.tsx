"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { matches as initialMatches } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Trash2 } from "lucide-react";
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
import type { Match } from "@/lib/types";

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  const statusColors = {
    live: "bg-red-500 text-white",
    upcoming: "bg-yellow-500 text-black",
    finished: "bg-green-500 text-white",
  };

  const handleRemoveMatch = (id: string) => {
    setMatches((prevMatches) => prevMatches.filter((match) => match.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Management</CardTitle>
        <CardDescription>
          Select a match to manage live data, including scores, events, and rosters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">
                  {match.teamA.name} vs {match.teamB.name}
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-xs font-bold uppercase", statusColors[match.status])}>
                    {match.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/match/${match.id}`}>
                      Manage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Match</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the match from the list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveMatch(match.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
