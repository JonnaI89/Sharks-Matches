"use client";

import type { Match, MatchEvent } from "@/lib/types";
import { Goal, Shield, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventTimelineProps {
  match: Match;
}

function getEventContent(event: MatchEvent) {
    switch(event.type) {
        case 'goal':
            return {
                Icon: Goal,
                description: `Goal by ${event.scorer.name}${event.assist ? `, assist by ${event.assist.name}` : ''}`
            };
        case 'penalty':
            return {
                Icon: Shield,
                description: `${event.duration} min penalty for ${event.player.name}`
            };
        case 'save':
            return {
                Icon: Hand,
                description: `Save by ${event.goalie.name}`
            }
        default:
            // Fallback for any unknown event types to prevent crashes
            return {
                Icon: Goal,
                description: 'An event occurred.'
            }
    }
}

export function EventTimeline({ match }: EventTimelineProps) {
  const { events, teamA, teamB } = match;

  if (events.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No events have occurred yet.</p>;
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.period !== b.period) {
      return b.period - a.period;
    }
    return b.time.localeCompare(a.time);
  });

  return (
    <div className="space-y-6">
      {sortedEvents.map((event) => {
        const isHomeTeam = event.teamId === teamA.id;
        const team = isHomeTeam ? teamA : teamB;
        const { Icon, description } = getEventContent(event);

        return (
          <div
            key={event.id}
            className={cn(
              "flex w-full items-center gap-4",
              !isHomeTeam && "flex-row-reverse" // This creates the zigzag effect
            )}
          >
            {/* Icon with team-specific color */}
            <div className="flex-shrink-0">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isHomeTeam ? "bg-primary/10" : "bg-muted" // Blueish for home, gray for away
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isHomeTeam ? "text-primary" : "text-foreground" // Blue icon for home, black/white for away
                  )}
                />
              </span>
            </div>

            {/* Event Details */}
            <div className={cn("flex-grow", !isHomeTeam && "text-right")}>
              <p className="font-semibold">{team.name}</p>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-center w-20">
              <span className="font-mono text-xs text-muted-foreground">P{event.period}</span>
              <span className="block font-mono text-sm font-bold">{event.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
