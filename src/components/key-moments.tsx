"use client";

import { useState } from "react";
import type { Match, MatchEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateKeyMomentInsights, type KeyMomentInsightsOutput } from "@/ai/flows/key-moment-insights";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wand2, Zap, Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KeyMomentsProps {
  match: Match;
}

function formatMatchDataForAI(match: Match): string {
  const { teamA, teamB, scoreA, scoreB, events } = match;

  let eventLog = events
    .map((event: MatchEvent) => {
      const teamName = event.teamId === teamA.id ? teamA.name : teamB.name;
      if (event.type === 'goal') {
        const assistText = event.assist ? ` (Assist: ${event.assist.name})` : '';
        return `P${event.period} ${event.time} - GOAL for ${teamName} by ${event.scorer.name}${assistText}.`;
      } else {
        return `P${event.period} ${event.time} - PENALTY for ${teamName}, ${event.player.name} (${event.duration} min).`;
      }
    })
    .join('\n');

  return `
Match: ${teamA.name} vs ${teamB.name}
Final Score: ${scoreA} - ${scoreB}
Status: ${match.status}

Event Log:
${eventLog || 'No events recorded.'}
  `;
}

export function KeyMoments({ match }: KeyMomentsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<KeyMomentInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    try {
      const matchData = formatMatchDataForAI(match);
      const result = await generateKeyMomentInsights({ matchData });
      setInsights(result);
    } catch (e) {
      setError("Failed to generate insights. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Match Analysis</CardTitle>
        <CardDescription>
          Generate AI-powered insights to discover key moments, turning points, and interesting narratives from the match.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={handleGenerateInsights} disabled={loading}>
          <Wand2 className="mr-2 h-4 w-4" />
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>

        {loading && (
          <div className="mt-6 space-y-4 text-left">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && <p className="mt-4 text-destructive">{error}</p>}

        {insights && (
          <Accordion type="multiple" className="mt-6 text-left" defaultValue={["key-moments", "turning-points", "narratives"]}>
            <AccordionItem value="key-moments">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Key Moments
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  {insights.keyMoments.map((moment, i) => <li key={i}>{moment}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="turning-points">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" /> Turning Points
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  {insights.turningPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="narratives">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" /> Interesting Narratives
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  {insights.interestingNarratives.map((narrative, i) => <li key={i}>{narrative}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
