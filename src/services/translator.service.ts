import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Language } from 'src/schemas/word.schema';
import { ConfigService } from '@nestjs/config';
import {
  Dialogue,
  News,
  NewWord,
  GrammerQuestion,
} from './courses/language/lesson.service';

@Injectable()
export class TranslatorService {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      organization: this.configService.get<string>('OPENAI_ORGANIZATION'),
    });
  }

  async sendPrompt<T>(prompt: string): Promise<T> {
    const response = await this.client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                prompt +
                '.Response:JSON object without Markdown formatting and any extra text',
            },
          ],
        },
      ],
      temperature: 1,
      max_output_tokens: 4096,
    });
    console.log('response', response.output_text);
    return JSON.parse(response.output_text) as T;
  }

  async translate(
    text: string,
    level: string,
    targetLanguage: string,
    language: string,
  ): Promise<{
    example: string;
    meaning: string;
    translation: string;
    synonyms: string[];
    contexts: string[];
  }> {
    return this.sendPrompt(
      `You're a Language tutor.Language: ${targetLanguage}.Level: ${level}.Word: ${text}.
      Give a JSON:  {"example": "Simple daily sentence using the word.","meaning": "Meaning for ${level} learner.","translation": "Translation in ${language}.","synonyms": ["word1", "word2"],"contexts": ["context1", "context2"]}`,
    );
  }

  async getNewsByGrammer(
    level: string,
    targetLanguage: string,
    grammer: string,
    interests: string[],
  ): Promise<News> {
    return this.sendPrompt<News>(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.Grammar: ${grammer}.
      I want you to give a recent news article that is related to the grammar in 2-3 paragraph.Im interested to ${interests.join(', ')}.
      Give a JSON:{"news": "the news","explanation": "the details of the used grammer"}`,
    );
  }

  async getQuestionByGrammer(
    level: string,
    targetLanguage: string,
    grammer: string,
    interests: string[],
  ): Promise<GrammerQuestion> {
    return this.sendPrompt<GrammerQuestion>(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.interests:${interests.join(', ')}.
      Grammar: ${grammer}.Now ask a question to force me to use the grammer.Give a JSON:  {"question": "Question"}`,
    );
  }

  async questionCorrection(
    level: string,
    targetLanguage: string,
    question: string,
    answer: string,
  ): Promise<{
    corrections: string[];
    alternative: string;
    correct: 'yes' | 'no';
    score: number;
  }> {
    return this.sendPrompt(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.I want you to check if the answer and my grammer is correct.Question: ${question}.Answer: ${answer}.
      Give a JSON:{"corrections": ["List of my mistakes"], "alternative": "Alternative Answer", "correct": "Is my answer correct? ["yes","no"]","score": "Score of the answer from 0 to 100["NUMBER"]"}`,
    );
  }

  async getShortDialogByGrammer(
    level: string,
    targetLanguage: string,
    grammer: string,
    interests: string[],
  ): Promise<Dialogue> {
    return this.sendPrompt<Dialogue>(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.interests:${interests.join(', ')}.
      Grammar: ${grammer}.Now give me a daily dialogue with this grammer and my interests.
      Give a JSON:  {"dialogue": [{"name":"Name of the first person, "sentence":"Sentence"}, {"name":"Name of the second person, "sentence":"Sentence"}]}`,
    );
  }

  async getSomeWords(
    level: string,
    targetLanguage: string,
    interests: string[],
  ): Promise<NewWord[]> {
    return this.sendPrompt<NewWord[]>(
      `You're a tutor.Language:${targetLanguage}, Level: ${level}.interests:${interests.join(',')}.
      Give me 3 useful word in the daily conversation with three examples and usable context.
      Give a JSON: [{"word": "Word","examples":["EXAMPLES"], context:["CONTEXT"]}`,
    );
  }

  async getGrammer(title: string, language: Language) {
    const response = await this.client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: `I'm learning grammar.Topic: ${title}.Language:${language}.Give a simple explanation (1 short paragraph).Format:{"explanation": "EXPLANATION"}`,
            },
          ],
        },
      ],
      temperature: 1,
      max_output_tokens: 256,
    });
    return JSON.parse(response.output_text);
  }

  async getGrammerExamples(title: string, language: Language) {
    const response = await this.client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: `I'm learning grammar.Topic:${title}.Language:${language}.Give 5 daily conversation examples with a short explanation for each. Response Format:{"examples": [{"sentence": "SENTENCE", "explanation": "EXPLANATION"}]}`,
            },
          ],
        },
      ],
      temperature: 1,
      max_output_tokens: 512,
    });

    return JSON.parse(response.output_text);
  }

  async textToSpeech(text: string) {
    try {
      const mp3Response = await this.client.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: text,
        response_format: 'mp3',
      });

      return mp3Response;
    } catch (error) {
      console.error(error);
      throw new Error('TTS failed');
    }
  }

  getExamFunction() {
    return {
      type: 'function',
      function: {
        name: 'get_exam_sample',
        description:
          'Generate a language exam sample based on user preferences',
        parameters: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'Target language to learn (e.g., English, Spanish)',
            },
            level: {
              type: 'string',
              description: 'Proficiency level (e.g., A2, B1, C1)',
            },
            exam: {
              type: 'string',
              description: 'Type of exam (e.g., TOEFL, IELTS)',
            },
            topic: {
              type: 'string',
              description:
                'Topic of the exam sample (e.g., environment, health)',
            },
          },
          required: ['language', 'level', 'exam', 'topic'],
        },
      },
    };
  }
}
