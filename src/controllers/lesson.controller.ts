import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LessonService } from 'src/services/courses/language/lesson.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/lesson')
export class LessonController {
  constructor(private readonly service: LessonService) {}

  @Get('/')
  async getLesson(@User() user: UserProfileModel) {
    return this.service.getLesson(user);
  }

  @Get('/grammer/question')
  async getGrammerQuestion(@User() user: UserProfileModel) {
    return this.service.getGrammerQuestion(user);
  }

  @Post('/grammer/correction')
  async questionCorrection(
    @User() user: UserProfileModel,
    @Body() body: { answer: string },
  ) {
    return this.service.questionCorrection(user, body.answer);
  }

  @Post('/reading/correction')
  async readingCorrection(
    @User() user: UserProfileModel,
    @Body() body: { answer: string },
  ) {
    return this.service.readingCorrection(user, body.answer);
  }

  @Post('/reading/answers')
  async applyReadingAnswers(
    @User() user: UserProfileModel,
    @Body()
    body: {
      questionIndex: number;
      isCorrect: boolean;
      questionType: 'choices' | 'simple';
    },
  ) {
    return this.service.applyReadingAnswers(user, body);
  }

  @Post('/finish-lesson')
  async finishLesson(@User() user: UserProfileModel) {
    return this.service.finishLesson(user);
  }
}
