import type { Match } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";

interface ScoreboardProps {
  match: Match | undefined | null;
}

export function Scoreboard({ match }: ScoreboardProps) {
  if (!match) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-center text-center">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-8 w-1/3" />
            </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center text-center">
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-lg md:text-2xl font-semibold truncate max-w-full">{match.teamA.name}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 md:space-x-4 px-2">
            <span className="text-3xl md:text-5xl font-bold text-primary">{match.scoreA}</span>
            <div className="flex flex-col items-center">
                <Badge variant="secondary" className="mb-1 text-xs md:text-sm">
                  {match.status === 'live' ? `P${match.period}` : match.status.toUpperCase()}
                </Badge>
                <span className="text-lg md:text-2xl font-mono font-bold">{match.time}</span>
            </div>
            <span className="text-3xl md:text-5xl font-bold text-primary">{match.scoreB}</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-lg md:text-2xl font-semibold truncate max-w-full">{match.teamB.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
