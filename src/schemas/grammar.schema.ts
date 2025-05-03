import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { Language } from './word.schema';

export type GrammarDocument = HydratedDocument<Grammar>;

export type Definition = {
  [key: string]: {
    [key in Language]?: {
      definition: string;
      examples: string;
      fillInBlank: {
        question: string;
        answer: string;
      };
      multipleChoice: {
        question: string;
        answer: string;
      };
      article: {
        [key: string]: string[];
      };
    };
  };
};

@Schema({ collection: 'grammars' })
export class Grammar extends SchemaBase {
  @Prop({ required: true })
  item: string;

  @Prop({ required: true })
  language: Language;

  @Prop({ required: false })
  level?: string;

  @Prop({ required: true })
  index: number;

  @Prop({ type: Object, default: {}, required: false })
  definition?: Definition;
}

export const GrammarSchema = SchemaFactory.createForClass(Grammar);
