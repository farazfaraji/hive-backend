import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { Lesson, LessonDocument } from 'src/schemas/lesson.schema';

@Injectable()
export class LessonRepository implements RepositoryAbstract<LessonDocument> {
  constructor(@InjectModel(Lesson.name) public model: Model<LessonDocument>) {}

  getTarget(): Model<LessonDocument> {
    return this.model;
  }
}
