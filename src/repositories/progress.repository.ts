import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { Progress, ProgressDocument } from 'src/schemas/progress.schema';

@Injectable()
export class ProgressRepository
  implements RepositoryAbstract<ProgressDocument>
{
  constructor(
    @InjectModel(Progress.name) public model: Model<ProgressDocument>,
  ) {}

  getTarget(): Model<ProgressDocument> {
    return this.model;
  }
}
