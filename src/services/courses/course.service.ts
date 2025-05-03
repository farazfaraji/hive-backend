import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Course,
  LanguageCourse,
  LanguageCourseDocument,
} from 'src/schemas/language/language-course.schema';
import { UserProfileModel } from '../auth.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateLanguageCourseDto } from 'src/dtos/plan/create-language-course.dto';
import { UserService } from '../user.service';
import { ExamType, Interests } from 'src/constants/courses.constant';
import { Language } from 'src/schemas/word.schema';
import { PlanService } from '../plan.service';
@Injectable()
export class CourseService {
  constructor(
    @InjectModel(LanguageCourse.name)
    public model: Model<LanguageCourseDocument>,
    private readonly userService: UserService,
    private readonly planService: PlanService,
  ) {}

  async createLanguageCourse(
    user: UserProfileModel,
    dto: CreateLanguageCourseDto,
  ) {
    // Check if course already exists
    const existingCourse = await this.model.findOne({
      user: user._id,
    });

    if (existingCourse) {
      return existingCourse;
    }

    await this.planService.createPlan(user, Course.Language);

    await this.userService.addCourse(user, Course.Language);

    // Create new course if it doesn't exist
    return await this.model.create({
      user: user._id,
      uniqueId: uuidv4(),
      interests: dto.interests,
      mainLanguage: dto.mainLanguage,
      targetLanguage: dto.targetLanguage,
      examType: dto.examType,
    });
  }

  async getLanguageCourse(
    user: UserProfileModel,
  ): Promise<LanguageCourse | null> {
    const existingCourse = await this.model.findOne({
      user: user._id,
    });

    return existingCourse;
  }

  async getAllCourses(user: UserProfileModel) {
    const existingCourse = await this.userService.getUserCourses(user);

    const allAvailableCourses: Course[] = [
      'Language',
      'Math',
      'Programming',
    ] as Course[];

    const formattedExistingCourses = existingCourse.map((course) => ({
      name: course,
      endpoint: `/lesson/${course.toLowerCase()}`,
    }));

    const formattedAllCourses = allAvailableCourses
      .filter((course) => !existingCourse.includes(course))
      .map((course) => ({
        name: course,
        endpoint: `/course/new/${course.toLowerCase()}`,
      }));

    return {
      existingCourse: formattedExistingCourses,
      allCourses: formattedAllCourses,
    };
  }

  getLanguageInterests() {
    return Interests;
  }

  getExams() {
    return Object.entries(ExamType).map(([key, value]) => ({
      key,
      value,
    }));
  }

  getLanguages() {
    return Object.entries(Language).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
