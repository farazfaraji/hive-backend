import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserProgress } from '../schemas/user.schema';
import { AbstractService } from 'src/abstracts/service.abstract';
import { Course } from 'src/schemas/language/language-course.schema';
import { UserProfileModel } from './auth.service';
@Injectable()
export class UserService extends AbstractService<User, UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async getUserCourses(user: UserProfileModel): Promise<Course[]> {
    const userData = await this.userModel.findById(user._id);
    return userData?.courses || [];
  }

  async addCourse(user: UserProfileModel, course: Course) {
    if (course === Course.Language) {
      await this.addProgress(user, course, {
        course: course,
        progress: {
          grammarIndex: 1,
        },
      });
    }

    return this.userModel.findByIdAndUpdate(
      user._id,
      { $push: { courses: course } },
      { new: true },
    );
  }

  async addProgress(
    user: UserProfileModel,
    course: Course,
    progress: UserProgress,
  ) {
    const existingProgress = await this.userModel.findOne({
      _id: user._id,
      'progress.course': course,
    });

    if (!existingProgress) {
      return this.userModel.findByIdAndUpdate(
        user._id,
        { $push: { progress: progress } },
        { new: true },
      );
    }
  }

  async getProgress<T>(user: UserProfileModel, course: Course): Promise<T> {
    const userData = await this.userModel.findById(user._id);
    return userData?.progress.find((p) => p.course === course).progress as T;
  }
}
