import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
export type LessonDocument = HydratedDocument<Lesson>;

export type Grammar = {
  grammar: string;
  examples: string[];
  questions: { text: string; answer: string }[];
};

@Schema({ collection: 'lessons' })
export class Lesson extends SchemaBase {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: Object, default: {} })
  lesson?: any;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
