import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { UserProfileModel } from 'src/services/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Course } from 'src/schemas/language/language-course.schema';
import { CourseService } from 'src/services/courses/course.service';
import { CreateLanguageCourseDto } from 'src/dtos/plan/create-language-course.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/courses')
export class CoursesController {
  constructor(private readonly service: CourseService) {}

  @Post('/language/create')
  async createLanguageCourse(
    @User() user: UserProfileModel,
    @Body() dto: CreateLanguageCourseDto,
  ) {
    return this.service.createLanguageCourse(user, dto);
  }

  @Get('/language/details')
  async getLanguageDetails() {
    const interests = this.service.getLanguageInterests();
    const languages = this.service.getLanguages();
    const exams = this.service.getExams();
    return {
      interests,
      languages,
      exams,
    };
  }

  @Get('/courses')
  async getCources(@User() user: UserProfileModel): Promise<{
    existingCourse: { name: Course; endpoint: string }[];
    allCourses: { name: Course; endpoint: string }[];
  }> {
    return this.service.getAllCourses(user);
  }
}
