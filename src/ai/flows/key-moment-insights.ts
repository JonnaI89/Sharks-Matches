'use server';

/**
 * @fileOverview A flow to analyze match data and identify key moments, turning points, and interesting narratives.
 *
 * - generateKeyMomentInsights - A function that triggers the analysis of match data.
 * - KeyMomentInsightsInput - The input type for the generateKeyMomentInsights function.
 * - KeyMomentInsightsOutput - The return type for the generateKeyMomentInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeyMomentInsightsInputSchema = z.object({
  matchData: z
    .string()
    .describe('Detailed data from the floorball match, including goals, penalties, and player statistics.'),
});

export type KeyMomentInsightsInput = z.infer<typeof KeyMomentInsightsInputSchema>;

const KeyMomentInsightsOutputSchema = z.object({
  keyMoments: z
    .array(z.string())
    .describe('A list of key moments in the match, such as critical goals or game-changing plays.'),
  turningPoints: z
    .array(z.string())
    .describe('A list of turning points in the match where momentum shifted significantly.'),
  interestingNarratives: z
    .array(z.string())
    .describe('A list of interesting narratives or storylines that emerged during the match.'),
});

export type KeyMomentInsightsOutput = z.infer<typeof KeyMomentInsightsOutputSchema>;

export async function generateKeyMomentInsights(input: KeyMomentInsightsInput): Promise<KeyMomentInsightsOutput> {
  return keyMomentInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'keyMomentInsightsPrompt',
  input: {schema: KeyMomentInsightsInputSchema},
  output: {schema: KeyMomentInsightsOutputSchema},
  prompt: `Analyze the following floorball match data and identify key moments, turning points, and interesting narratives. Provide a list of each.

Match Data:
{{{matchData}}}

Key Moments:
Turning Points:
Interesting Narratives:`,
});

const keyMomentInsightsFlow = ai.defineFlow(
  {
    name: 'keyMomentInsightsFlow',
    inputSchema: KeyMomentInsightsInputSchema,
    outputSchema: KeyMomentInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
