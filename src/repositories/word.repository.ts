import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { Word, WordDocument } from 'src/schemas/word.schema';

@Injectable()
export class WordRepository implements RepositoryAbstract<WordDocument> {
  constructor(@InjectModel(Word.name) public model: Model<WordDocument>) {}

  getTarget(): Model<WordDocument> {
    return this.model;
  }
}
