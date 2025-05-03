import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase } from 'src/abstracts/schema.abstract';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Course } from './language/language-course.schema';
import { LanguagePlan } from 'src/constants/plans.constant';

export type PlanDocument = HydratedDocument<Plan>;

export type PlanItem = {
  name: LanguagePlan;
  detail: string[];
  isPassed: boolean;
  score: number;
};

export type PlanDetail = {
  current: number;
  plans: PlanItem[];
};

@Schema({ collection: 'plans' })
export class Plan extends SchemaBase {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: {
      current: { type: Number, required: true },
      plans: [
        {
          name: { type: String, required: true },
          detail: [{ type: String, required: true }],
          isPassed: { type: Boolean, required: true },
          score: { type: Number, required: true },
        },
      ],
    },
  })
  detail: PlanDetail;

  @Prop({ required: true, enum: Course })
  course: Course;

  @Prop({
    required: false,
    type: [
      {
        current: { type: Number, required: true },
        plans: [
          {
            name: { type: String, required: true },
            detail: [{ type: String, required: true }],
          },
        ],
      },
    ],
  })
  passedPlans: PlanDetail[];
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
