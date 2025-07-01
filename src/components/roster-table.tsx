import type { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RosterTable({ teamName, players }: { teamName: string; players: Player[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">A</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players && players.length > 0 ? (
                            players.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.number}</TableCell>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-center">{p.stats.goals}</TableCell>
                                    <TableCell className="text-center">{p.stats.assists}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No players for this match.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
