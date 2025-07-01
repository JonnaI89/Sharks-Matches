"use client";

import { useState, useEffect } from "react";
import type { Match, PenaltyEvent, GoalEvent } from "@/lib/types";
import { Scoreboard } from "@/components/scoreboard";
import { ActivePenalties } from "@/components/active-penalties";

const timeToSeconds = (time: string) => {
    if (!time) return 0;
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
};

const secondsToTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function LiveMatchWrapper({ match: matchProp }: { match: Match }) {
    // We use the prop to initialize state, but also to receive updates (e.g. goals, penalties from admin)
    const [liveMatch, setLiveMatch] = useState<Match>(matchProp);

    // This effect syncs external changes (from props) with the internal state,
    // preserving the component's own live timer.
    useEffect(() => {
        setLiveMatch(currentLiveMatch => ({
            ...matchProp,
            // Only preserve the running time if the component has a time state already.
            // Otherwise, use the time from the prop. This handles initial render correctly.
            time: currentLiveMatch ? currentLiveMatch.time : matchProp.time, 
        }));
    }, [matchProp]);
    
    // This effect runs the clock
    useEffect(() => {
        if (liveMatch.status !== 'live') {
            // Ensure the displayed time is the official time when clock is not running
            if (liveMatch.time !== matchProp.time) {
                setLiveMatch(prev => ({...prev, time: matchProp.time}));
            }
            return;
        }

        const interval = setInterval(() => {
            setLiveMatch(prevMatch => {
                if (prevMatch.status !== 'live') return prevMatch;
                
                const newMatch = JSON.parse(JSON.stringify(prevMatch));
                const periodDurationInSeconds = newMatch.periodDurationMinutes * 60;

                const currentTimeInSeconds = timeToSeconds(newMatch.time);
                if (currentTimeInSeconds >= periodDurationInSeconds) { // Stop at period end
                    return prevMatch; // Stop the timer
                }

                newMatch.time = secondsToTime(currentTimeInSeconds + 1);

                newMatch.events = newMatch.events.map((event: PenaltyEvent | GoalEvent) => {
                    if (event.type === 'penalty' && event.status === 'active' && event.expiresAt) {
                        const expirationTimeInSeconds = (event.expiresAt.period - 1) * periodDurationInSeconds + timeToSeconds(event.expiresAt.time);
                        const gameTimeInSeconds = (newMatch.period - 1) * periodDurationInSeconds + timeToSeconds(newMatch.time);
                        if (gameTimeInSeconds >= expirationTimeInSeconds) {
                            return { ...event, status: 'expired' };
                        }
                    }
                    return event;
                });

                return newMatch;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [liveMatch.status, liveMatch.time, matchProp.time]); // Rerun if status or official time changes

    return (
        <div className="space-y-6">
            <Scoreboard match={liveMatch} />
            <ActivePenalties match={liveMatch} />
        </div>
    );
}
