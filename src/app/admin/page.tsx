import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { matches } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const statusColors = {
    live: "bg-red-500 text-white",
    upcoming: "bg-yellow-500 text-black",
    finished: "bg-green-500 text-white",
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
              <TableHead className="text-right">Action</TableHead>
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
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/match/${match.id}`}>
                      Manage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
