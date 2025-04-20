import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryAbstract } from 'src/abstracts/repository.abstract';
import { Plan, PlanDocument } from 'src/schemas/plan.schema';

@Injectable()
export class PlanRepository implements RepositoryAbstract<PlanDocument> {
  constructor(@InjectModel(Plan.name) public model: Model<PlanDocument>) {}

  getTarget(): Model<PlanDocument> {
    return this.model;
  }
}
