import type { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RosterTable({ teamName, players }: { teamName: string; players: Player[] }) {
    const goalies = players.filter(p => p.isGoalie);
    const skaters = players.filter(p => !p.isGoalie);

    const calculateSavePercentage = (saves: number, goalsAgainst: number) => {
        const totalShots = saves + goalsAgainst;
        if (totalShots === 0) return "0.0%";
        const percentage = (saves / totalShots) * 100;
        return `${percentage.toFixed(1)}%`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
            </CardHeader>
            <CardContent>
                {players && players.length > 0 ? (
                    <div className="space-y-6">
                        {goalies.length > 0 && (
                             <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Goalies</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Player</TableHead>
                                            <TableHead className="text-center">Saves</TableHead>
                                            <TableHead className="text-center">GA</TableHead>
                                            <TableHead className="text-center">SV%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {goalies.map((g) => (
                                            <TableRow key={g.id}>
                                                <TableCell>{g.number}</TableCell>
                                                <TableCell className="font-medium">{g.name}</TableCell>
                                                <TableCell className="text-center">{g.stats.saves || 0}</TableCell>
                                                <TableCell className="text-center">{g.stats.goalsAgainst || 0}</TableCell>
                                                <TableCell className="text-center">
                                                    {calculateSavePercentage(g.stats.saves || 0, g.stats.goalsAgainst || 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        
                        {skaters.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Skaters</h4>
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
                                        {skaters.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.number}</TableCell>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell className="text-center">{p.stats.goals}</TableCell>
                                                <TableCell className="text-center">{p.stats.assists}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                ) : (
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
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No players for this match.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
