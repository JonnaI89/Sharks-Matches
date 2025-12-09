import type { Match } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TeamLogoProps {
  logo: string;
  name: string;
}

function TeamLogo({ logo, name }: TeamLogoProps) {
  const trimmedLogo = logo ? logo.trim() : "";
  const isUrl = trimmedLogo && (trimmedLogo.startsWith("http://") || trimmedLogo.startsWith("https://"));

  if (isUrl) {
    return (
      <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden" data-ai-hint="team logo">
        <img src={trimmedLogo} alt={`${name} logo`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground" data-ai-hint="team logo">
      {trimmedLogo}
      <span className="sr-only">{name} logo</span>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const statusColors: Record<string, string> = {
    live: "bg-red-500 text-white",
    upcoming: "bg-yellow-500 text-black",
    finished: "bg-green-500 text-white",
    paused: "bg-blue-500 text-white",
    break: "bg-orange-500 text-white",
  };

  const getCardTitle = () => {
    if (match.status === 'break') {
      return `Break until P${match.period}`;
    }
    if (match.status === 'finished') {
      return 'Finished';
    }
    if (match.status === 'upcoming') {
        if (match.date) {
            return format(new Date(match.date), "PPP");
        }
        return 'Upcoming';
    }
    return `Period ${match.period} - ${match.time}`;
  };

  return (
    <Link href={`/match/${match.id}`} className="block transition-transform hover:scale-105">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-4 bg-muted/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {getCardTitle()}
            </CardTitle>
            <Badge className={cn("text-xs font-bold uppercase", statusColors[match.status])}>
              {match.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-start justify-center gap-x-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <TeamLogo logo={match.teamA.logo} name={match.teamA.name} />
              <p className="font-semibold text-sm h-10 flex items-center justify-center text-center">{match.teamA.name}</p>
              <p className="text-4xl font-bold">{match.scoreA}</p>
            </div>
            
            <div className="pt-5 text-2xl font-light text-muted-foreground">vs</div>
            
            <div className="flex flex-col items-center gap-2">
              <TeamLogo logo={match.teamB.logo} name={match.teamB.name} />
              <p className="font-semibold text-sm h-10 flex items-center justify-center text-center">{match.teamB.name}</p>
              <p className="text-4xl font-bold">{match.scoreB}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
