'use server';
/**
 * @fileOverview Um agente de IA para analisar insights de educadores.
 *
 * - analyzeEducatorInsights - Uma função que lida com a análise das respostas dos alunos e gabaritos.
 * - EducatorInsightAnalysisInput - O tipo de entrada para a função analyzeEducatorInsights.
 * - EducatorInsightAnalysisOutput - O tipo de retorno para a função analyzeEducatorInsights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducatorInsightAnalysisInputSchema = z.object({
  answerKey: z.array(z.string()).describe('Um array com as respostas corretas para cada questão, em ordem.'),
  studentResponses: z.array(z.object({
    studentName: z.string().describe('O nome do aluno.'),
    answers: z.array(z.string()).describe('Um array com as respostas do aluno para cada questão, em ordem.'),
  })).describe('Um array de registros de alunos, cada um contendo nome e respostas.'),
});
export type EducatorInsightAnalysisInput = z.infer<typeof EducatorInsightAnalysisInputSchema>;

const EducatorInsightAnalysisOutputSchema = z.object({
  commonErrors: z.array(z.object({
    questionIndex: z.number().describe('O índice (baseado em 0) da questão onde ocorreu o erro comum.'),
    incorrectAnswer: z.string().describe('A resposta incorreta mais frequente para esta questão.'),
    count: z.number().describe('O número de alunos que deram esta resposta incorreta.'),
    analysis: z.string().optional().describe('Uma breve análise de por que esta resposta incorreta específica pode ser comum.'),
  })).describe('Uma lista de erros incorretos comuns entre os alunos para questões específicas.'),
  problematicQuestions: z.array(z.object({
    questionIndex: z.number().describe('O índice (baseado em 0) da questão que é problemática.'),
    errorRate: z.number().describe('A porcentagem de alunos que responderam esta questão incorretamente (0-100).'),
    reason: z.string().describe('Uma breve explicação de por que esta questão é considerada problemática (ex: alta taxa de erro, dificuldade do conceito).'),
  })).describe('Uma lista de questões com as quais um número significativo de alunos teve dificuldade.'),
  suggestedLearningTopics: z.array(z.string()).describe('Uma lista de tópicos de aprendizagem ou conceitos que os educadores devem revisar com os alunos, com base nos erros identificados.'),
}).describe('Análise do desempenho dos alunos, incluindo erros comuns, questões problemáticas e sugestões de tópicos de aprendizagem.');
export type EducatorInsightAnalysisOutput = z.infer<typeof EducatorInsightAnalysisOutputSchema>;

const educatorInsightAnalysisPrompt = ai.definePrompt({
  name: 'educatorInsightAnalysisPrompt',
  input: { schema: EducatorInsightAnalysisInputSchema },
  output: { schema: EducatorInsightAnalysisOutputSchema },
  prompt: `Você é um Analista Educacional Especialista. Sua tarefa é analisar o desempenho de uma turma em relação a um gabarito oficial.

GABARITO OFICIAL:
{{#each answerKey}}
- Questão {{@index}}: {{{this}}}
{{/each}}

RESPOSTAS DOS ALUNOS:
{{#each studentResponses}}
Aluno: {{{this.studentName}}}
Respostas: {{#each this.answers}}Q{{@index}}:{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
-------------------
{{/each}}

INSTRUÇÕES:
1. Compare cada resposta de cada aluno com o gabarito oficial (índice por índice).
2. Identifique "Erros Comuns": Quando vários alunos escolhem a mesma alternativa incorreta para uma questão.
3. Identifique "Questões Problemáticas": Questões com alta taxa de erro (onde muitos alunos erraram).
4. Sugira tópicos de revisão baseados nos padrões de erros detectados.

Responda inteiramente em Português do Brasil no formato JSON solicitado.`,
});

const educatorInsightAnalysisFlow = ai.defineFlow(
  {
    name: 'educatorInsightAnalysisFlow',
    inputSchema: EducatorInsightAnalysisInputSchema,
    outputSchema: EducatorInsightAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await educatorInsightAnalysisPrompt(input);
    if (!output) {
      throw new Error('O modelo não retornou uma resposta válida.');
    }
    return output;
  }
);

/**
 * Analisa as respostas agregadas dos alunos em relação a um gabarito oficial para identificar erros comuns.
 */
export async function analyzeEducatorInsights(input: EducatorInsightAnalysisInput): Promise<EducatorInsightAnalysisOutput> {
  return educatorInsightAnalysisFlow(input);
}
