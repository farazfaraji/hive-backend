import { Injectable } from '@nestjs/common';
import { UserProfileModel } from './auth.service';
import { Grammar, GrammarDocument } from 'src/schemas/grammar.schema';
import { AbstractService } from 'src/abstracts/service.abstract';
import { GrammarRepository } from 'src/repositories/grammar.repository';
import { TranslatorService } from './translator.service';
import { Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class GrammarService extends AbstractService<Grammar, GrammarDocument> {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly repository: GrammarRepository,
  ) {
    super(repository.getTarget());
  }

  async listGrammars(user: UserProfileModel) {
    const grammars = await this.findMany({ language: user.targetLanguage });
    return { data: grammars };
  }

  async getGrammar(
    user: UserProfileModel,
    grammarId: MongooseSchema.Types.ObjectId | string,
  ): Promise<Grammar> {
    const grammar = await this.findOne({
      _id: grammarId,
    });

    if (!grammar.definition) {
      const definition = await this.translatorService.getGrammer(
        grammar.item,
        user.targetLanguage,
      );
      await this.repository.model.updateOne(
        { _id: grammarId },
        {
          definition: definition.explanation,
        },
      );
      return { ...grammar, definition: definition.explanation };
    }

    return grammar;
  }

  async getExamples(user: UserProfileModel, grammarId: string) {
    const grammar = await this.findOne({
      _id: grammarId,
    });

    const examples = await this.translatorService.getGrammerExamples(
      grammar.item,
      user.targetLanguage,
    );
    return examples;
  }
}
