'use server';
/**
 * @fileOverview An AI agent for analyzing educator insights.
 *
 * - analyzeEducatorInsights - A function that handles the analysis of student responses and answer keys.
 * - EducatorInsightAnalysisInput - The input type for the analyzeEducatorInsights function.
 * - EducatorInsightAnalysisOutput - The return type for the analyzeEducatorInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducatorInsightAnalysisInputSchema = z.object({
  answerKey: z.array(z.string()).describe('An array of correct answers for each question, in order.'),
  studentResponses: z.array(z.object({
    studentName: z.string().describe('The name of the student.'),
    answers: z.array(z.string()).describe('An array of the student\'s answers to each question, in order.'),
  })).describe('An array of student records, each containing their name and answers.'),
});
export type EducatorInsightAnalysisInput = z.infer<typeof EducatorInsightAnalysisInputSchema>;

const EducatorInsightAnalysisOutputSchema = z.object({
  commonErrors: z.array(z.object({
    questionIndex: z.number().describe('The 0-based index of the question where the common error occurred.'),
    incorrectAnswer: z.string().describe('The most frequent incorrect answer for this question.'),
    count: z.number().describe('The number of students who gave this incorrect answer.'),
    analysis: z.string().optional().describe('A brief analysis of why this specific incorrect answer might be common.'),
  })).describe('A list of common incorrect answers across students for specific questions.'),
  problematicQuestions: z.array(z.object({
    questionIndex: z.number().describe('The 0-based index of the question that is problematic.'),
    errorRate: z.number().describe('The percentage of students who answered this question incorrectly (0-100).'),
    reason: z.string().describe('A brief explanation of why this question is considered problematic (e.g., high error rate, confusing wording).'),
  })).describe('A list of questions that a significant number of students struggled with.'),
  suggestedLearningTopics: z.array(z.string()).describe('A list of learning topics or concepts that educators should review with students, based on the identified errors and problematic questions.'),
}).describe('Analysis of student performance including common errors, problematic questions, and suggested learning topics.');
export type EducatorInsightAnalysisOutput = z.infer<typeof EducatorInsightAnalysisOutputSchema>;

const educatorInsightAnalysisPrompt = ai.definePrompt({
  name: 'educatorInsightAnalysisPrompt',
  input: { schema: EducatorInsightAnalysisInputSchema },
  output: { schema: EducatorInsightAnalysisOutputSchema },
  prompt: `As an expert educational analyst, your task is to analyze aggregated student responses against an official answer key to identify common errors, pinpoint problematic questions, and suggest targeted learning topics for educators.\n\nHere is the official answer key:\nAnswer Key (Question Index: Correct Answer):\n{{#each answerKey}}\n  Question {{ @index }}: {{{this}}}\n{{/each}}\n\nHere are the student responses:\n{{#each studentResponses}}\n  Student Name: {{{this.studentName}}}\n  Answers:\n  {{#each this.answers}}\n    Question {{ @index }}: {{{this}}}\n  {{/each}}\n{{/each}}\n\nAnalyze the provided data. For each question, compare student answers to the official answer key.\n\nIdentify:\n1.  **Common Errors**: For each question, if a particular incorrect answer is given by multiple students, list it as a common error. Include the question index, the specific incorrect answer, the count of students who gave it, and a brief analysis of the likely misconception.\n2.  **Problematic Questions**: Identify questions where a significant portion (e.g., more than 50%) of students answered incorrectly. For each problematic question, provide its index, the calculated error rate, and a concise reason for why this question is problematic (e.g., concept difficulty, unclear question wording, common misconception).\n3.  **Suggested Learning Topics**: Based on the common errors and problematic questions identified, infer and list specific learning topics or concepts that the students collectively seem to be struggling with. These suggestions should help educators refine their teaching materials and strategies.\n\nProvide your analysis in the specified JSON format.\n`,
});

const educatorInsightAnalysisFlow = ai.defineFlow(
  {
    name: 'educatorInsightAnalysisFlow',
    inputSchema: EducatorInsightAnalysisInputSchema,
    outputSchema: EducatorInsightAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await educatorInsightAnalysisPrompt(input);
    return output!;
  }
);

/**
 * Analyzes aggregated student responses against an official answer key to identify common errors
 * and suggest problematic questions or learning topics.
 *
 * @param input - The input containing the answer key and student responses.
 * @returns An analysis including common errors, problematic questions, and suggested learning topics.
 */
export async function analyzeEducatorInsights(input: EducatorInsightAnalysisInput): Promise<EducatorInsightAnalysisOutput> {
  return educatorInsightAnalysisFlow(input);
}
