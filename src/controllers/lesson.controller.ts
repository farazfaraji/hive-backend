import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LessonService } from 'src/services/lesson.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/lesson')
export class LessonController {
  constructor(private readonly service: LessonService) {}

  @Get('/')
  async getLesson(@User() user: UserProfileModel) {
    return this.service.getLesson(user);
  }

  @Get('/question')
  async getQuestion(@User() user: UserProfileModel) {
    return this.service.getQuestion(user);
  }

  @Post('/answer')
  async questionCorrection(
    @User() user: UserProfileModel,
    @Body() body: { answer: string },
  ) {
    return this.service.questionCorrection(user, body.answer);
  }

  @Post('/finish-lesson')
  async finishLesson(@User() user: UserProfileModel) {
    return this.service.finishLesson(user);
  }
}
