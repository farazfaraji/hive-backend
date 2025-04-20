import { Controller, Post, UseGuards } from '@nestjs/common';
import { PlanService } from 'src/services/plan.service';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Course } from 'src/schemas/language/language-course.schema';

@UseGuards(JwtAuthGuard)
@Controller('v1/plan')
export class PlanController {
  constructor(private readonly service: PlanService) {}

  @Post('/language')
  async createLanguagePlan(@User() user: UserProfileModel) {
    return this.service.createPlan(user, Course.Language);
  }
}
