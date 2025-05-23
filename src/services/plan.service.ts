import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanRepository } from 'src/repositories/plan.repository';
import { PlanDocument, Plan, PlanItem } from 'src/schemas/plan.schema';
import { UserProfileModel } from './auth.service';
import {
  ConversationPlans,
  Plans,
  LanguagePlan,
} from 'src/constants/plans.constant';
import { PlanDetail } from 'src/schemas/plan.schema';
import { AbstractService } from 'src/abstracts/service.abstract';
import { v4 as uuidv4 } from 'uuid';
import { Course } from 'src/schemas/language/language-course.schema';

@Injectable()
export class PlanService extends AbstractService<Plan, PlanDocument> {
  constructor(private readonly repository: PlanRepository) {
    super(repository.getTarget());
  }

  async createPlan(user: UserProfileModel, course: Course) {
    const numberOfLesson = 5;

    const coursePlans = Plans.find((p) => p.course === course)?.plans;

    if (!coursePlans) {
      throw new BadRequestException('Course not found');
    }

    // Select unique plans
    const selectedPlans: PlanItem[] = [];
    for (let i = 0; i < numberOfLesson; i++) {
      const exclude = selectedPlans.map((item) => item.name);
      const plan = this.getRandomUniqueItem(coursePlans, exclude);
      selectedPlans.push(plan);
    }

    // Create plan detail
    const planDetail: PlanDetail = {
      current: 0,
      plans: selectedPlans,
    };

    return this.insertIfNotExist(['user'], {
      user: user._id,
      uniqueId: uuidv4(),
      course,
      detail: planDetail,
      passedPlans: [],
    });
  }

  async finishPlan(user: UserProfileModel, plan: any) {
    await this.repository.model.updateOne(
      { user: user._id },
      {
        $push: {
          passedPlans: { ...plan, ...{ lastReview: null, reviews: 0 } },
        },
        $set: { [`detail.plans.${plan.detail.current}.isPassed`]: true },
      },
    );
  }

  private getRandomUniqueItem(array: string[], exclude: string[]): PlanItem {
    const availableItems = array.filter((item) => !exclude.includes(item));
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const plan = availableItems[randomIndex];
    if (plan === 'conversation') {
      const randomIndex = Math.floor(Math.random() * ConversationPlans.length);
      return {
        name: ConversationPlans[randomIndex] as LanguagePlan,
        detail: [ConversationPlans[randomIndex]],
        isPassed: false,
        score: 0,
      };
    }
    return {
      name: plan as LanguagePlan,
      detail: [],
      isPassed: false,
      score: 0,
    };
  }
}
