import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/abstracts/service.abstract';
import { LanguageArticleRepository } from 'src/repositories/language-article.repository';
import { Grammar } from 'src/schemas/grammar.schema';
import {
  LanguageArticle,
  LanguageArticleContent,
  LanguageArticleDocument,
} from 'src/schemas/language/language-article.schema';
import { Language } from 'src/schemas/word.schema';
import { TranslatorService } from 'src/services/translator.service';
import * as fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { LanguageCourse } from 'src/schemas/language/language-course.schema';
import { ArticleType } from 'src/constants/article.constant';

export type GrammarArticleResponse = {
  article: {
    subject: string;
    pages: string[];
  };
  cost: string;
};

@Injectable()
export class LanguageArticleService extends AbstractService<
  LanguageArticle,
  LanguageArticleDocument
> {
  streamPipeline = promisify(pipeline);
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly repository: LanguageArticleRepository,
  ) {
    super(repository.getTarget());
  }

  async getGrammarArticle(languageCourse: LanguageCourse, grammar: Grammar) {
    const randomInterest =
      languageCourse.interests[
        Math.floor(Math.random() * languageCourse.interests.length)
      ];

    const article = await this.findOne({
      language: languageCourse.targetLanguage,
      type: ArticleType.Grammar,
      uniques: {
        interest: randomInterest,
        grammar: grammar.index,
        level: languageCourse.level,
      },
    });

    if (!article) {
      console.log('article not found');
      return this.generateGrammarArticle(
        languageCourse.targetLanguage,
        languageCourse.level,
        randomInterest,
        grammar,
      );
    }
    return article;
  }

  private async generateGrammarArticle(
    language: Language,
    level: string,
    interest: string,
    grammar: Grammar,
  ): Promise<LanguageArticle> {
    const prompt = `You're a language tutor.Language: ${language}.Level: ${level}.I'm learning this grammer: ${grammar.item}.
        Im interested in this subject: ${interest}.give me an article to read and using this grammer in the article in 15 lines in 3 pages. use <bold>{used_word}</bold> that places which this grammer is used.
        Response in JSON:
        {"article": {subject:"article subject",pages:["page1","page2","page3"]},"cost":"token_cost_usd}`;

    const article =
      await this.translatorService.sendPrompt<GrammarArticleResponse>(prompt);

    const content: LanguageArticleContent[] = [];

    for (const page of article.article.pages) {
      const fileName = await this.generateAudio(page);
      content.push({ id: uuidv4(), text: page, audio: fileName });
    }

    return this.insertOne({
      subject: article.article.subject,
      cost: Number(article.cost),
      language,
      type: ArticleType.Grammar,
      content,
      uniques: { interest, grammar: grammar.index, level },
      uniqueId: uuidv4(),
    });
  }

  private async generateAudio(text: string) {
    try {
      // Remove markdown tags from text
      const cleanText = text.replace(/<[^>]*>/g, '');

      const mp3Response = await this.translatorService.textToSpeech(cleanText);
      const dirPath = 'assets/articles';

      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const fileName = `${dirPath}/${uuidv4()}.mp3`;
      await this.streamPipeline(
        mp3Response.body,
        fs.createWriteStream(fileName),
      );
      return fileName;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  async play(audioId: string) {
    console.log(audioId);
    const audio = await this.repository.model.findOne({
      content: { $elemMatch: { id: audioId } },
    });
    const result = audio?.toObject();
    const contentItem = result?.content.find((item) => item.id === audioId);
    return contentItem?.audio;
  }
}
