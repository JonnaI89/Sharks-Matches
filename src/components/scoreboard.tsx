import { useState, useEffect } from "react";
import type { Match } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "./ui/skeleton";

interface ScoreboardProps {
  match: Match | undefined | null;
}

export function Scoreboard({ match }: ScoreboardProps) {
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (match?.status !== 'break' || !match.breakEndTime) {
      setBreakTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = match.breakEndTime! - now;

      if (remaining <= 0) {
        setBreakTimeRemaining("00:00");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 1000 / 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        setBreakTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    // Set initial value
    const now = Date.now();
    const remaining = match.breakEndTime! - now;
     if (remaining <= 0) {
        setBreakTimeRemaining("00:00");
     } else {
        const minutes = Math.floor(remaining / 1000 / 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        setBreakTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
     }

    return () => clearInterval(interval);
  }, [match?.status, match?.breakEndTime]);


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
  
  const getBadgeText = () => {
    switch (match.status) {
      case 'live':
      case 'paused':
        return `P${match.period}`;
      case 'break':
        return 'BREAK';
      default:
        return match.status.toUpperCase();
    }
  };

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
                {getBadgeText()}
            </Badge>
            
            {match.status === 'break' ? (
                <span className="mt-1 font-mono text-lg font-bold md:text-2xl text-accent">
                    {breakTimeRemaining || '00:00'}
                </span>
            ) : (
                <span className="mt-1 font-mono text-lg font-bold md:text-2xl">{match.time}</span>
            )}

            {match.status === 'break' && (
              <span className="text-xs text-muted-foreground">Until P{match.period}</span>
            )}
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
