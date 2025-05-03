import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { HydratedDocument } from 'mongoose';
import { Language } from '../word.schema';
import { ArticleType } from 'src/constants/article.constant';

export type LanguageArticleDocument = HydratedDocument<LanguageArticle>;

export type LanguageArticleContent = {
  id: string;
  text: string;
  audio: string;
};

@Schema({ collection: 'language_articles' })
export class LanguageArticle extends SchemaBase {
  @Prop({ required: true, type: [{ text: String, audio: String }] })
  content: LanguageArticleContent[];

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true, enum: Language })
  language: Language;

  @Prop({ required: true, type: Object })
  uniques: any;

  @Prop({ required: true, enum: ArticleType })
  type: ArticleType;
}

export const LanguageArticleSchema =
  SchemaFactory.createForClass(LanguageArticle);
