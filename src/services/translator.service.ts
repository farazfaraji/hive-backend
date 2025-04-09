import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Language } from 'src/schemas/word.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranslatorService {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      organization: this.configService.get<string>('OPENAI_ORGANIZATION'),
    });
  }

  async sendPrompt(prompt: string) {
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
                '.Response should be a raw JSON object without Markdown formatting or code fences',
            },
          ],
        },
      ],
      temperature: 1,
      max_output_tokens: 2048,
    });
    console.log(JSON.stringify(response, null, 4));
    return JSON.parse(response.output_text);
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
      `You're a Language tutor.Language: ${targetLanguage}.Level: ${level}.Word: ${text}.Give a JSON:  {"example": "Simple daily sentence using the word.","meaning": "Meaning for ${level} learner.","translation": "Translation in ${language}.","synonyms": ["word1", "word2"],"contexts": ["context1", "context2"]}`,
    );
  }

  async getNewsByGrammer(
    level: string,
    targetLanguage: string,
    grammer: string,
    interests: string[],
  ) {
    return this.sendPrompt(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.Grammar: ${grammer}.
      I want you to give a recent news article that is related to the grammar in 2 paragraph.Im interested to ${interests.join(', ')}.
      Give a JSON:{"news": "the news","explanation": "the details of the used grammer"}`,
    );
  }

  async getQuestionByGrammer(
    level: string,
    targetLanguage: string,
    grammer: string,
    interests: string[],
  ) {
    return this.sendPrompt(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.interests:${interests.join(', ')}.Grammar: ${grammer}.Now ask a question to force me to use the grammer.Give a JSON:  {"question": "Question"}`,
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
  ) {
    return this.sendPrompt(
      `You're a language tutor.Language: ${targetLanguage}.Level: ${level}.interests:${interests.join(', ')}.Grammar: ${grammer}.Now give me a daily dialogue with this grammer and my interests.Give a JSON:  {"dialogue": [{"firstPerson":"Name of the person, "sentence":"Sentence"}, {"secondPerson":"Name of the person, "sentence":"Sentence"}]}`,
    );
  }

  async getSomeWords(
    level: string,
    targetLanguage: string,
    interests: string[],
  ) {
    return this.sendPrompt(
      `You're a tutor.Language:${targetLanguage}, Level: ${level}.interests:${interests.join(',')}.Give me 3 useful word in the daily conversation with three examples and usable context.Give a JSON: [{"word": "Word","examples":["EXAMPLES"], context:["CONTEXT"]}`,
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

    console.log(response.output_text);
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
}
