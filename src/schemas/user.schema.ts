import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { Language } from './word.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User extends SchemaBase {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  exam?: string;

  @Prop({ required: true, type: Number, default: 0 })
  level: number;

  @Prop({ required: true, type: [String], default: [] })
  interests: string[];

  @Prop({ required: true, type: String, default: 'en' })
  targetLanguage: Language;

  @Prop({ required: true, type: String, default: 'en' })
  language: Language;
}

export const UserSchema = SchemaFactory.createForClass(User);
