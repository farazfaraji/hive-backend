import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { Language } from './word.schema';

export type GrammarDocument = HydratedDocument<Grammar>;

export interface Definition {
  id: string;
  explanation: string;
}

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

  @Prop({ type: [String], default: [], required: false })
  definition?: string[];
}

export const GrammarSchema = SchemaFactory.createForClass(Grammar);
