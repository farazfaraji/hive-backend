import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';

export type WordDocument = HydratedDocument<Word>;

export enum Language {
  English = 'en',
  French = 'fr',
  Spanish = 'es',
  German = 'de',
  Italian = 'it',
  Portuguese = 'pt',
  Dutch = 'nl',
  Polish = 'pl',
  Russian = 'ru',
  Persian = 'fa',
  Arabic = 'ar',
  Turkish = 'tr',
  Hindi = 'hi',
  Japanese = 'ja',
  Korean = 'ko',
  Chinese = 'zh',
}

@Schema({ collection: 'words' })
export class Word extends SchemaBase {
  @Prop({ required: true, enum: Language })
  language: Language;

  @Prop({ required: true })
  word: string;

  @Prop({ required: false })
  example?: string;

  @Prop({ required: false })
  meaning?: string;

  @Prop({ required: false })
  translation?: string;

  @Prop({ required: false })
  synonyms?: string[];

  @Prop({ required: false })
  contexts?: string[];
}

export const WordSchema = SchemaFactory.createForClass(Word);
