import type { MatchEvent } from "@/lib/types";
import { Goal, Square } from "lucide-react";
import { teams } from "@/lib/mock-data";

interface EventTimelineProps {
  events: MatchEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
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
    <div className="space-y-8">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="font-mono text-sm text-muted-foreground">P{event.period}</span>
            <span className="font-mono text-sm font-bold">{event.time}</span>
          </div>
          <div className="flex-shrink-0">
            {event.type === 'goal' ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Goal className="h-5 w-5 text-green-600 dark:text-green-400" />
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Square className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </span>
            )}
          </div>
          <div className="flex-grow">
            <p className="font-semibold">{teams[event.teamId as keyof typeof teams]?.name}</p>
            {event.type === 'goal' ? (
              <p className="text-sm text-muted-foreground">
                Goal by {event.scorer.name}
                {event.assist ? `, assist by ${event.assist.name}` : ''}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {event.duration} min penalty for {event.player.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
