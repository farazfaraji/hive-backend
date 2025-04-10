import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  Dialogue,
  News,
  NewWord,
} from 'src/services/courses/language/lesson.service';
export type ProgressDocument = HydratedDocument<Progress>;

export interface Exam {
  plan: string;
  text: string;
  choices: {
    question: string;
    choices: string[];
    answer: string;
  }[];
  simple: {
    question: string;
    answer: string;
  }[];
}

export interface Definition {
  id: string;
  explanation: string;
}

export interface Lesson {
  grammar: string | MongooseSchema.Types.ObjectId;
  news: News;
  dialogue: Dialogue;
  words: NewWord[];
  exam: Exam;
}

@Schema({ collection: 'progresses' })
export class Progress extends SchemaBase {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  lastQuestion?: string;

  @Prop({ required: false })
  numberOfQuestions?: number;

  @Prop({ required: false })
  numberOfWrongAnswers?: number;

  @Prop({
    required: false,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Grammar',
  })
  currentGrammar?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: [String], default: [] })
  completedGrammarIds: string[];

  @Prop({ required: false, type: Object, default: {} })
  lesson?: Lesson;

  @Prop({ required: false, type: Object, default: {} })
  exam?: Exam;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
