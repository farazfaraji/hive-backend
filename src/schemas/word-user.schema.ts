import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { Language } from './word.schema';

export type WordUserDocument = HydratedDocument<WordUser>;

@Schema({ collection: 'word_users' })
export class WordUser extends SchemaBase {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Word',
  })
  wordId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: String })
  language: Language;

  @Prop({ required: true, type: Boolean, default: false })
  isLearned: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  isFavorite: boolean;

  @Prop({ required: true, type: Date, default: Date.now })
  lastTry: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  nextTry: Date;

  @Prop({ required: true, type: Number, default: 0 })
  numberOfTry: number;
}

export const WordUserSchema = SchemaFactory.createForClass(WordUser);

export type WordUserDto = {
  wordId: MongooseSchema.Types.ObjectId;
  uniqueId: string;
};
