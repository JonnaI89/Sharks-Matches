"use client";

import { useState, useEffect } from "react";
import type { Match, PenaltyEvent, GoalEvent } from "@/lib/types";
import { Scoreboard } from "@/components/scoreboard";
import { ActivePenalties } from "@/components/active-penalties";

const timeToSeconds = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
};

const secondsToTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


export function LiveMatchWrapper({ match: initialMatch }: { match: Match }) {
    const [match, setMatch] = useState(initialMatch);

    useEffect(() => {
        if (match.status !== 'live') {
            return;
        }

        const interval = setInterval(() => {
            setMatch(prevMatch => {
                const newMatch = JSON.parse(JSON.stringify(prevMatch));

                const currentTimeInSeconds = timeToSeconds(newMatch.time);
                if (currentTimeInSeconds >= 1200) { // 20 minutes
                    // Stop the timer, but wait for admin to end period
                    return newMatch;
                }

                newMatch.time = secondsToTime(currentTimeInSeconds + 1);

                // Check for penalty expirations
                newMatch.events = newMatch.events.map((event: PenaltyEvent | GoalEvent) => {
                    if (event.type === 'penalty' && event.status === 'active' && event.expiresAt) {
                        const isExpired = newMatch.period > event.expiresAt.period ||
                            (newMatch.period === event.expiresAt.period && timeToSeconds(newMatch.time) >= timeToSeconds(event.expiresAt.time));
                        if (isExpired) {
                            return { ...event, status: 'expired' };
                        }
                    }
                    return event;
                });

                return newMatch;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [match.status]);


    return (
        <div className="space-y-6">
            <Scoreboard match={match} />
            <ActivePenalties match={match} />
        </div>
    );
}
