import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/abstracts/service.abstract';
import { Progress, ProgressDocument } from 'src/schemas/progress.schema';
import { ProgressRepository } from 'src/repositories/progress.repository';

@Injectable()
export class ProgressService extends AbstractService<
  Progress,
  ProgressDocument
> {
  constructor(private readonly repository: ProgressRepository) {
    super(repository.getTarget());
  }
}
