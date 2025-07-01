"use client";

import { useState, useEffect } from "react";
import type { Match } from "@/lib/types";

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

export function useLiveMatch(matchProp: Match | undefined | null) {
    const [liveMatch, setLiveMatch] = useState<Match | undefined | null>(matchProp);

    // Effect 1: Sync with the database source of truth (props)
    useEffect(() => {
        setLiveMatch(matchProp);
    }, [matchProp]);
    
    // Effect 2: Run the local clock for a smooth visual effect
    useEffect(() => {
        if (liveMatch?.status !== 'live') {
            return; // Do nothing if the match is not live
        }

        const interval = setInterval(() => {
            // We only update the time client-side. All other data comes from props.
            setLiveMatch(prevMatch => {
                if (!prevMatch) return prevMatch;
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
    }, [liveMatch?.status, liveMatch?.time, liveMatch?.periodDurationMinutes]); 

    return liveMatch;
}
