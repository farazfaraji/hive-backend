import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Language } from '../word.schema';
import { Interests } from 'src/constants/courses.constant';

export type LanguageCourceDocument = HydratedDocument<LanguageCource>;

export enum Course {
  'Language' = 'Language',
  'Math' = 'Math',
  'Programming' = 'Programming',
}

@Schema({ collection: 'language_courses' })
export class LanguageCource extends SchemaBase {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: [String] })
  interests: (typeof Interests)[number][];

  @Prop({ required: true, enum: Language })
  mainLanguage: Language;

  @Prop({ required: true, enum: Language })
  targetLanguage: Language;

  @Prop({ required: true })
  examType: string;

  @Prop({ required: true, default: 'A1' })
  level: string;
}

export const LanguageCourceSchema =
  SchemaFactory.createForClass(LanguageCource);
