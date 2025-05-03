import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import {
  LanguageArticle,
  LanguageArticleDocument,
} from 'src/schemas/language/language-article.schema';

@Injectable()
export class LanguageArticleRepository
  implements RepositoryAbstract<LanguageArticleDocument>
{
  constructor(
    @InjectModel(LanguageArticle.name)
    public model: Model<LanguageArticleDocument>,
  ) {}

  getTarget(): Model<LanguageArticleDocument> {
    return this.model;
  }
}
