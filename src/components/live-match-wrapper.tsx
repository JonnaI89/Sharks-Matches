"use client";

import { useState, useEffect } from "react";
import type { Match } from "@/lib/types";
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
    const [liveMatch, setLiveMatch] = useState<Match>(matchProp);

    // Effect 1: Sync with the database source of truth (props)
    // This is crucial. Whenever the database changes (new prop), we reset our local state.
    // This ensures goals, penalties, and admin clock adjustments are always reflected.
    useEffect(() => {
        setLiveMatch(matchProp);
    }, [matchProp]);
    
    // Effect 2: Run the local clock for a smooth visual effect
    // This effect ONLY runs when the match is live.
    useEffect(() => {
        if (liveMatch.status !== 'live') {
            return; // Do nothing if the match is not live
        }

        const interval = setInterval(() => {
            // We only update the time client-side. All other data comes from props.
            setLiveMatch(prevMatch => {
                const newMatch = { ...prevMatch }; // shallow copy
                const periodDurationInSeconds = newMatch.periodDurationMinutes * 60;
                const currentTimeInSeconds = timeToSeconds(newMatch.time);

                if (currentTimeInSeconds >= periodDurationInSeconds) {
                    // The server will eventually change the status, but we can stop the client timer.
                    clearInterval(interval);
                    return prevMatch;
                }

                newMatch.time = secondsToTime(currentTimeInSeconds + 1);
                return newMatch;
            });
        }, 1000);

        return () => clearInterval(interval);
    // Re-run the effect if the status changes OR if the time is changed externally (by the sync effect).
    }, [liveMatch.status, liveMatch.time, liveMatch.periodDurationMinutes]); 

    return (
        <div className="space-y-6">
            <Scoreboard match={liveMatch} />
            <ActivePenalties match={liveMatch} />
        </div>
    );
}
