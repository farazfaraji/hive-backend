import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { WordUser, WordUserDocument } from 'src/schemas/word-user.schema';

@Injectable()
export class WordUserRepository
  implements RepositoryAbstract<WordUserDocument>
{
  constructor(
    @InjectModel(WordUser.name) public model: Model<WordUserDocument>,
  ) {}

  getTarget(): Model<WordUserDocument> {
    return this.model;
  }
}
