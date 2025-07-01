import type { Player } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CareerStats } from "@/app/stats/page";

interface StatsTableProps {
  players: (Player & { careerStats: CareerStats })[];
}

export function StatsTable({ players }: StatsTableProps) {
  const skaters = players.filter(p => !p.isGoalie).sort((a,b) => (b.careerStats.goals + b.careerStats.assists) - (a.careerStats.goals + a.careerStats.assists));
  const goalies = players.filter(p => p.isGoalie).sort((a,b) => b.careerStats.gamesPlayed - a.careerStats.gamesPlayed);

  const calculateSavePercentage = (saves: number, goalsAgainst: number) => {
    const totalShots = saves + goalsAgainst;
    if (totalShots === 0) return ".000";
    return (saves / totalShots).toFixed(3).toString().replace(/^0+/, '');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Skaters</h3>
        <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">GP</TableHead>
              <TableHead className="text-center">G</TableHead>
              <TableHead className="text-center">A</TableHead>
              <TableHead className="text-center">Pts</TableHead>
              <TableHead className="text-center">PIM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skaters.length > 0 ? skaters.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.number}</TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-center">{player.careerStats.gamesPlayed}</TableCell>
                <TableCell className="text-center">{player.careerStats.goals}</TableCell>
                <TableCell className="text-center">{player.careerStats.assists}</TableCell>
                <TableCell className="text-center">{player.careerStats.goals + player.careerStats.assists}</TableCell>
                <TableCell className="text-center">{player.careerStats.penalties}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No skaters on this team.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Goalies</h3>
         <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">GP</TableHead>
              <TableHead className="text-center">Saves</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">SV%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalies.length > 0 ? goalies.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.number}</TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-center">{player.careerStats.gamesPlayed}</TableCell>
                <TableCell className="text-center">{player.careerStats.saves}</TableCell>
                <TableCell className="text-center">{player.careerStats.goalsAgainst}</TableCell>
                <TableCell className="text-center">{calculateSavePercentage(player.careerStats.saves, player.careerStats.goalsAgainst)}</TableCell>
              </TableRow>
            )) : (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No goalies on this team.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
