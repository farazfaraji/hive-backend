import { Injectable } from '@nestjs/common';
import { UserProfileModel } from '../../auth.service';
import { GrammarService } from './grammar.service';
import { TranslatorService } from '../../translator.service';
import { CourseService } from '../course.service';
import { PlanService } from 'src/services/plan.service';
import {
  Course,
  LanguageCourse,
} from 'src/schemas/language/language-course.schema';
import { Lesson, LessonDocument } from 'src/schemas/lesson.schema';
import { AbstractService } from 'src/abstracts/service.abstract';
import { LessonRepository } from 'src/repositories/lesson.repository';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from 'src/services/user.service';
import { LanguageProgress } from 'src/schemas/user.schema';
import { LanguageArticleService } from './language-article.service';
import { LanguagePlan } from 'src/constants/plans.constant';
export type GrammarResponse = {
  title: string;
  grammer: string;
  examples: string[];
  fill_in_blank: { text: string; answer: string; hint: string }[];
  multiple_choice: { text: string; choices: string[]; answer: string }[];
  cost: string;
  article: { subject: string; pages: string[] };
};

export type CorrectionReading = {
  advices: string[];
  score: number;
};

export type News = {
  news: string;
  explanation: string;
};

export type Dialogue = {
  dialogue: { name: string; sentence: string }[];
};

export type NewWord = {
  word: string;
  examples: string[];
  context: string[];
};

export type GrammerQuestion = {
  question: string;
};

@Injectable()
export class LessonService extends AbstractService<Lesson, LessonDocument> {
  constructor(
    private readonly grammarService: GrammarService,
    private readonly translatorService: TranslatorService,
    private readonly courseService: CourseService,
    private readonly planService: PlanService,
    private readonly userService: UserService,
    private readonly languageArticleService: LanguageArticleService,
    private readonly repository: LessonRepository,
  ) {
    super(repository.getTarget());
  }

  async getLesson(user: UserProfileModel) {
    const [lesson, plan] = await Promise.all([
      this.findOne({ user: user._id }),
      this.planService.findOne({ user: user._id }),
    ]);

    const currentPlanDetail = plan.detail.plans[plan.detail.current];

    if (!lesson) {
      await this.insertOne({
        user: user._id,
        uniqueId: uuidv4(),
      });
    } else if (lesson.lesson) {
      return {
        type: currentPlanDetail.name,
        data: lesson.lesson,
      };
    }

    const languageCourse = await this.courseService.getLanguageCourse(user);
    if (!languageCourse) {
      throw new Error('Language course not found');
    }

    if (currentPlanDetail.isPassed) {
      this.planService.updateOne(
        { user: user._id },
        {
          'detail.current': plan.detail.current + 1,
        },
      );
      return this.getLesson(user);
    }

    const data = await this.generateLesson(
      user,
      currentPlanDetail.name,
      currentPlanDetail.detail,
      languageCourse,
    );

    await this.upsert({ user: user._id }, { lesson: data });

    return this.getLesson(user);
  }

  async generateLesson(
    user: UserProfileModel,
    planName: LanguagePlan,
    detail: string[],
    languageCourse: LanguageCourse,
  ) {
    const toReturn = [];

    switch (planName) {
      case LanguagePlan.Grammar:
        const progress = await this.userService.getProgress<LanguageProgress>(
          user,
          Course.Language,
        );

        const grammar = await this.grammarService.findOne({
          index: progress.grammarIndex,
        });

        if (!grammar) {
          throw new Error('Grammer not found');
        }

        toReturn.push(`You're a language tutor.Language: ${languageCourse.targetLanguage}.Level: ${languageCourse.level}.
        can you explain this grammer: ${grammar.item}. and give me 5 examples and 5 in fill the blank questions to force me to use the grammer.
        for fill the blank questions, show the blank part by <blank>.show the normal form of the answer by <verb>verb</verb> at the end of the sentence.
        also 5 questions to force me to use the grammer in multiple choice. Response in JSON:
        {"title":"title of the grammer","grammar": "explanation", "examples": ["example1"], "fill_in_blank": [{text:"question",answer:"correct answer","hint":"simple hint close to the answer"}],"multiple_choice": [{text:"question",choices:["choice1"],answer:"answer"}],"cost":"cost of this text generation in usd`);
        let data = {};

        for (const prompt of toReturn) {
          const response =
            await this.translatorService.sendPrompt<object>(prompt);
          data = { ...data, ...response };
        }

        const article = await this.languageArticleService.getGrammarArticle(
          languageCourse,
          grammar,
        );
        data = {
          ...data,
          ...{ article: { subject: article.subject, pages: article.content } },
        };
        return data as GrammarResponse;
    }
  }

  async finishLesson(user: UserProfileModel) {
    const lesson = await this.findOne({ user: user._id });
    await this.updateOne({ user: user._id }, { lesson: null });
    await this.planService.finishPlan(user, lesson);
    return { status: true };
  }
}
