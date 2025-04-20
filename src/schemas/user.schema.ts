import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { Course } from './language/language-course.schema';

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

  @Prop({ required: false, type: [String], enum: Course, default: [] })
  courses?: Course[];
}

export const UserSchema = SchemaFactory.createForClass(User);
