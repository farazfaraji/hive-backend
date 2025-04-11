import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserRepository implements RepositoryAbstract<UserDocument> {
  constructor(@InjectModel(User.name) public model: Model<UserDocument>) {}

  findUserByEmail({ email }: { email: string }) {
    return this.model.findOne({ email });
  }

  async findUserById({ id }: { id: string }) {
    console.log('here' + id);
    const user = await this.model.findOne({ _id: id });
    console.log(user);
    return user;
  }

  getTarget(): Model<UserDocument> {
    return this.model;
  }
}
