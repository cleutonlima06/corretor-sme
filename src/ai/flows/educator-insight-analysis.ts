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
    reason: z.string().describe('Uma breve explicação de por que esta questão é considerada problemática (ex: alta taxa de erro, enunciado confuso).'),
  })).describe('Uma lista de questões com as quais um número significativo de alunos teve dificuldade.'),
  suggestedLearningTopics: z.array(z.string()).describe('Uma lista de tópicos de aprendizagem ou conceitos que os educadores devem revisar com os alunos, com base nos erros identificados.'),
}).describe('Análise do desempenho dos alunos, incluindo erros comuns, questões problemáticas e sugestões de tópicos de aprendizagem.');
export type EducatorInsightAnalysisOutput = z.infer<typeof EducatorInsightAnalysisOutputSchema>;

const educatorInsightAnalysisPrompt = ai.definePrompt({
  name: 'educatorInsightAnalysisPrompt',
  input: { schema: EducatorInsightAnalysisInputSchema },
  output: { schema: EducatorInsightAnalysisOutputSchema },
  prompt: `Como um analista educacional especializado, sua tarefa é analisar as respostas agregadas dos alunos em relação a um gabarito oficial para identificar erros comuns, apontar questões problemáticas e sugerir tópicos de aprendizagem direcionados para os educadores.

Aqui está o gabarito oficial:
Gabarito (Índice da Questão: Resposta Correta):
{{#each answerKey}}
  Questão {{ @index }}: {{{this}}}
{{/each}}

Aqui estão as respostas dos alunos:
{{#each studentResponses}}
  Nome do Aluno: {{{this.studentName}}}
  Respostas:
  {{#each this.answers}}
    Questão {{ @index }}: {{{this}}}
  {{/each}}
{{/each}}

Analise os dados fornecidos. Para cada questão, compare as respostas dos alunos com o gabarito oficial.

Identifique:
1. **Erros Comuns**: Para cada questão, se uma resposta incorreta específica for dada por vários alunos, liste-a como um erro comum. Inclua o índice da questão, a resposta incorreta específica, a contagem de alunos que a deram e uma breve análise do provável equívoco ou erro de raciocínio.
2. **Questões Problemáticas**: Identifique questões onde uma parte significativa (ex: mais de 50%) dos alunos respondeu incorretamente. Para cada questão problemática, forneça seu índice, a taxa de erro calculada e um motivo conciso de por que esta questão é problemática (ex: dificuldade do conceito, enunciado pouco claro, equívoco comum).
3. **Sugestões de Tópicos de Aprendizagem**: Com base nos erros comuns e questões problemáticas identificadas, infira e liste tópicos ou conceitos de aprendizagem específicos com os quais os alunos parecem estar lutando coletivamente. Essas sugestões devem ajudar os educadores a refinar seus materiais e estratégias de ensino.

Forneça sua análise no formato JSON especificado. Responda inteiramente em Português do Brasil.`,
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
 * Analisa as respostas agregadas dos alunos em relação a um gabarito oficial para identificar erros comuns
 * e sugerir questões problemáticas ou tópicos de aprendizagem.
 *
 * @param input - A entrada contendo o gabarito e as respostas dos alunos.
 * @returns Uma análise incluindo erros comuns, questões problemáticas e tópicos sugeridos.
 */
export async function analyzeEducatorInsights(input: EducatorInsightAnalysisInput): Promise<EducatorInsightAnalysisOutput> {
  return educatorInsightAnalysisFlow(input);
}
