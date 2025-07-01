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
        <div className="grid grid-cols-3 items-center text-center gap-x-2 gap-y-2">
          {/* Row 1: Team Names */}
          <div className="text-left md:text-center col-span-1">
            <span className="text-base md:text-2xl font-semibold truncate">{match.teamA.name}</span>
          </div>
          
          <div className="hidden md:block col-span-1">
             <Badge variant="secondary" className="text-xs md:text-sm">
                {match.status === 'live' ? `P${match.period}` : match.status.toUpperCase()}
              </Badge>
          </div>

          <div className="text-right md:text-center col-span-1">
            <span className="text-base md:text-2xl font-semibold truncate">{match.teamB.name}</span>
          </div>

          {/* Row 2: Scores and Time */}
           <div className="text-left md:text-center col-span-1">
             <span className="text-4xl md:text-5xl font-bold text-primary">{match.scoreA}</span>
          </div>

          <div className="flex flex-col items-center col-span-1">
             <Badge variant="secondary" className="mb-1 text-xs md:hidden">
                {match.status === 'live' ? `P${match.period}` : match.status.toUpperCase()}
              </Badge>
              <span className="text-lg md:text-2xl font-mono font-bold">{match.time}</span>
          </div>
          
          <div className="text-right md:text-center col-span-1">
             <span className="text-4xl md:text-5xl font-bold text-primary">{match.scoreB}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
