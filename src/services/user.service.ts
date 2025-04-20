import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
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
    return this.userModel.findByIdAndUpdate(
      user._id,
      { $push: { courses: course } },
      { new: true },
    );
  }
}
