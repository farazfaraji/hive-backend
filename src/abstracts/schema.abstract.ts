import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export class SchemaBase {
  _id?: string | MongooseSchema.Types.ObjectId;

  @Prop({ unique: true, index: true, required: true })
  uniqueId: string;

  @Prop({ type: Boolean, index: true, required: true, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date, required: true, default: new Date() })
  createdAt?: Date;
}
