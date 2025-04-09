import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { Grammar, GrammarDocument } from 'src/schemas/grammar.schema';

@Injectable()
export class GrammarRepository implements RepositoryAbstract<GrammarDocument> {
  constructor(
    @InjectModel(Grammar.name) public model: Model<GrammarDocument>,
  ) {}

  getTarget(): Model<GrammarDocument> {
    return this.model;
  }
}
