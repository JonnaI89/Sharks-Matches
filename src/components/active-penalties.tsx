"use client";

import type { Match, PenaltyEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Timer } from "lucide-react";

const timeToSeconds = (time: string): number => {
    if (!time) return 0;
    const [minutes, seconds] = time.split(':').map(Number);
    return (minutes * 60) + seconds;
};

const secondsToTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function getPenaltyTimeInfo(penalty: PenaltyEvent, match: Match): { secondsLeft: number; timeString: string } {
    if (!penalty.expiresAt) return { secondsLeft: 0, timeString: "00:00" };
    
    const periodDurationInSeconds = match.periodDurationMinutes * 60;

    const currentTimeTotalSeconds = (match.period - 1) * periodDurationInSeconds + timeToSeconds(match.time);
    const expirationTimeTotalSeconds = (penalty.expiresAt.period - 1) * periodDurationInSeconds + timeToSeconds(penalty.expiresAt.time);

    const secondsLeft = expirationTimeTotalSeconds - currentTimeTotalSeconds;

    return { secondsLeft, timeString: secondsToTime(secondsLeft) };
}

export function ActivePenalties({ match }: { match: Match }) {
    const penaltiesWithTime = match.events
        .filter((e): e is PenaltyEvent => e.type === 'penalty' && e.status === 'active')
        .map(p => ({
            penalty: p,
            timeInfo: getPenaltyTimeInfo(p, match)
        }))
        .filter(p => p.timeInfo.secondsLeft > 0);

    if (penaltiesWithTime.length === 0) {
        return null;
    }

    const teamAPenalties = penaltiesWithTime.filter(p => p.penalty.teamId === match.teamA.id);
    const teamBPenalties = penaltiesWithTime.filter(p => p.penalty.teamId === match.teamB.id);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="text-primary" />
                    <span>Active Penalties</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {teamAPenalties.length > 0 && (
                            <>
                                <h3 className="font-semibold mb-2">{match.teamA.name}</h3>
                                <ul className="space-y-2">
                                    {teamAPenalties.map(({ penalty, timeInfo }) => (
                                        <li key={penalty.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                            <span>#{penalty.player.number} {penalty.player.name} ({penalty.duration} min)</span>
                                            <span className="font-mono font-bold flex items-center gap-1">
                                                <Timer className="h-4 w-4" />
                                                {timeInfo.timeString}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                    <div>
                        {teamBPenalties.length > 0 && (
                            <>
                                <h3 className="font-semibold mb-2">{match.teamB.name}</h3>
                                <ul className="space-y-2">
                                    {teamBPenalties.map(({ penalty, timeInfo }) => (
                                        <li key={penalty.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                            <span>#{penalty.player.number} {penalty.player.name} ({penalty.duration} min)</span>
                                            <span className="font-mono font-bold flex items-center gap-1">
                                                <Timer className="h-4 w-4" />
                                                {timeInfo.timeString}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
