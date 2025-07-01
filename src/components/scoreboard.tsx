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
        <div className="grid grid-cols-[1fr_auto_1fr] items-start justify-items-center gap-x-2 md:gap-x-4">
          {/* Team A */}
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <span className="text-base font-semibold leading-tight md:text-2xl">{match.teamA.name}</span>
            <span className="text-4xl font-bold text-primary md:text-5xl">{match.scoreA}</span>
          </div>

          {/* Middle Info */}
          <div className="flex flex-col items-center gap-y-1 pt-1">
            <Badge variant="secondary" className="text-xs md:text-sm">
                {match.status === 'live' ? `P${match.period}` : match.status.toUpperCase()}
            </Badge>
            <span className="mt-1 font-mono text-lg font-bold md:text-2xl">{match.time}</span>
          </div>

          {/* Team B */}
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <span className="text-base font-semibold leading-tight md:text-2xl">{match.teamB.name}</span>
            <span className="text-4xl font-bold text-primary md:text-5xl">{match.scoreB}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
