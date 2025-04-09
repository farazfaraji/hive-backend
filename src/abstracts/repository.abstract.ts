import { Model } from 'mongoose';

export abstract class RepositoryAbstract<Document> {
  public abstract getTarget(): Model<Document>;
}
