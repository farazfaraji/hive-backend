import { BadRequestException, Injectable } from '@nestjs/common';
import { UserProfileModel } from '../../auth.service';
import { GrammarService } from './grammar.service';
import { TranslatorService } from '../../translator.service';
import { ProgressService } from './progress.service';
import { Grammar } from 'src/schemas/grammar.schema';
import { Exam, Lesson } from 'src/schemas/progress.schema';
import { v4 as uuidv4 } from 'uuid';
import { Schema as MongooseSchema } from 'mongoose';

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
export class LessonService {
  constructor(
    private readonly grammarService: GrammarService,
    private readonly progressService: ProgressService,
    private readonly translatorService: TranslatorService,
  ) {}

  async getLesson(user: UserProfileModel) {
    const progress = await this.progressService.findOne({ user: user._id });

    if (progress?.lesson) {
      const grammar = await this.grammarService.getGrammar(
        user,
        progress.currentGrammar,
      );
      return { ...progress.lesson, grammar };
    }

    const grammar = progress?.currentGrammar
      ? await this.grammarService.getGrammar(user, progress.currentGrammar)
      : await this.getNextLesson(user);

    const news = await this.translatorService.getNewsByGrammer(
      user.language,
      user.targetLanguage,
      grammar.item,
      user.interests,
    );

    const dialogue = await this.translatorService.getShortDialogByGrammer(
      user.language,
      user.targetLanguage,
      grammar.item,
      user.interests,
    );

    const exam = await this.getExam(user);

    const words = await this.translatorService.getSomeWords(
      user.language,
      user.targetLanguage,
      user.interests,
    );

    const lesson: Lesson = {
      grammar: grammar._id,
      news,
      dialogue,
      exam,
      words,
    };

    const isExist = await this.progressService.findOne({ user: user._id });
    if (isExist) {
      await this.progressService.updateOne({ _id: user._id }, { lesson });
    } else {
      await this.progressService.insertOne({
        currentGrammar: grammar._id as MongooseSchema.Types.ObjectId,
        completedGrammarIds: [],
        user: user._id,
        uniqueId: uuidv4(),
        lesson,
      });
    }

    return { ...lesson, grammar };
  }

  async getQuestion(user: UserProfileModel) {
    const progress = await this.progressService.findOne({ user: user._id });

    if (!progress?.lesson) {
      throw new Error('Lesson not found');
    }

    const numberofQuestions = progress.numberOfQuestions || 0;

    if (numberofQuestions === 3) {
      throw new BadRequestException(
        'You have reached the maximum number of questions',
      );
    }

    const grammar = await this.grammarService.findOne({
      _id: progress.currentGrammar,
    });

    const question = progress.lastQuestion
      ? progress.lastQuestion
      : await this.getNewQuestion(user, grammar, numberofQuestions);

    return { question: question, numberofQuestions };
  }

  async getNewQuestion(
    user: UserProfileModel,
    grammar: Grammar,
    numberofQuestions: number,
  ) {
    const question = (
      await this.translatorService.getQuestionByGrammer(
        user.language,
        user.targetLanguage,
        grammar.item,
        user.interests,
      )
    ).question;

    this.progressService.updateOne(
      { user: user._id },
      {
        lastQuestion: question,
        numberOfQuestions: numberofQuestions + 1,
      },
    );
    return question;
  }

  async readingCorrection(
    user: UserProfileModel,
    answer: string,
  ): Promise<CorrectionReading> {
    const progress = await this.progressService.findOne({ user: user._id });

    const reading = progress.lesson.exam.text;

    const prompt = `You're a language tutor.Language: ${user.targetLanguage}.Level: ${user.level}.
    Imagine this you are a corrector for the ${user.exam} exam. correct my answer. give me some advices, and score it from 0 to 100.
    This is reading: ${reading}
    This is my answer: ${answer}
    Give a JSON: {"advices": ["string"], "score": "number"}}`;

    return this.translatorService.sendPrompt<CorrectionReading>(prompt);
  }

  async questionCorrection(user: UserProfileModel, answer: string) {
    const progress = await this.progressService.findOne({ user: user._id });
    if (!progress) {
      throw new Error('Progress not found');
    }

    if (!progress.lastQuestion) {
      throw new Error('Question not found');
    }

    const result = await this.translatorService.questionCorrection(
      user.level.toString(),
      user.targetLanguage,
      progress.lastQuestion,
      answer,
    );

    const numberOfWrongAnswers = progress.numberOfWrongAnswers || 0;

    if (result.correct === 'yes' || numberOfWrongAnswers === 3) {
      await this.progressService.updateOne(
        { user: user._id },
        { lastQuestion: null, numberOfWrongAnswers: 0 },
      );
    } else {
      await this.progressService.updateOne(
        { user: user._id },
        { numberOfWrongAnswers: numberOfWrongAnswers + 1 },
      );
    }
    return result;
  }

  async getExam(user: UserProfileModel): Promise<Exam> {
    if (!user.exam) {
      return null;
    }

    const progress = await this.progressService.findOne({ user: user._id });

    if (progress?.exam) {
      return progress.exam;
    }

    const plan = ['reading'];
    const currentPlan = plan[Math.floor(Math.random() * plan.length)];
    let prompt = '';
    if (currentPlan === 'reading') {
      prompt = `You're a language tutor.Language: ${user.targetLanguage}.Level: ${user.level}.
      Exam:${user.exam}.I want you to give me a real sample for the exam in ${user.level} for ${currentPlan}.
      5 choices questions and 5 true/false questions.
      Give a JSON: {"text": "reading text","choices":
      [{"question": "question", "choices": ["choice1", "choice2", "choice3", "choice4"],"answer":"answer"}],
      "simple":[{"question":"true/false questions","answer":"answer"}]}`;
    } else {
      prompt = `You're a language tutor.Language: ${user.targetLanguage}.Level: ${user.level}.
      Exam: ${user.exam}.I want you to give me a short sample for the exam in ${user.level} for writing.`;
    }
    const exam = await this.translatorService.sendPrompt<Exam>(prompt);
    await this.progressService.updateOne({ user: user._id }, { exam: exam });

    return { ...exam, plan: currentPlan };
  }

  async getNextLesson(user: UserProfileModel): Promise<Grammar> {
    const progress = await this.progressService.findOne({ _id: user._id });
    const grammers = await this.grammarService.listGrammars(user);
    for (const grammar of grammers.data) {
      if (progress?.completedGrammarIds.length) {
        if (progress.completedGrammarIds.includes(grammar._id.toString())) {
          continue;
        }
      }

      return grammar;
    }
  }

  async finishLesson(user: UserProfileModel) {
    const progress = await this.progressService.findOne({ user: user._id });
    if (!progress) {
      throw new Error('Progress not found');
    }

    if (!progress.currentGrammar) {
      throw new Error('No current grammar lesson to complete');
    }

    const currentGrammarId = progress.currentGrammar.toString();

    // Prevent duplicate grammar IDs
    if (!progress.completedGrammarIds.includes(currentGrammarId)) {
      progress.completedGrammarIds = [
        ...progress.completedGrammarIds,
        currentGrammarId,
      ];
    }

    await this.progressService.updateOne(
      { user: user._id },
      {
        lesson: null,
        numberOfQuestions: 0,
        numberOfWrongAnswers: 0,
        lastQuestion: null,
        completedGrammarIds: progress.completedGrammarIds,
        currentGrammar: null,
      },
    );
    return { status: 'success' };
  }
}
