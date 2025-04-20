import { Injectable } from '@nestjs/common';
import { UserProfileModel } from './../../auth.service';
import { Grammar, GrammarDocument } from 'src/schemas/grammar.schema';
import { AbstractService } from 'src/abstracts/service.abstract';
import { GrammarRepository } from 'src/repositories/grammar.repository';
import { TranslatorService } from './../../translator.service';
import { Schema as MongooseSchema } from 'mongoose';
import { Language } from 'src/schemas/word.schema';
import { CourseService } from '../course.service';
@Injectable()
export class GrammarService extends AbstractService<Grammar, GrammarDocument> {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly courseService: CourseService,
    private readonly repository: GrammarRepository,
  ) {
    super(repository.getTarget());
    //this.fixData();
  }

  async fixData() {
    try {
      let index = 1;
      const grammars = await this.findMany({ language: Language.German });
      console.log(`Found ${grammars.length} grammar entries to update`);

      for (const grammar of grammars) {
        const result = await this.repository.model.updateOne(
          { _id: grammar._id },
          {
            $set: {
              index: index++,
              language: Language.English,
              item: grammar.item,
              definition: [],
            },
          },
        );

        if (result.modifiedCount === 0) {
          console.warn(`Failed to update grammar with ID: ${grammar._id}`);
        } else {
          console.log(`Updated grammar ${grammar._id} with index ${index - 1}`);
        }
      }
      console.log('Update process completed');
    } catch (error) {
      console.error('Error in fixData:', error);
      throw error;
    }
  }

  async listGrammars(user: UserProfileModel) {
    const languageCourse = await this.courseService.getLanguageCourse(user);
    if (!languageCourse) {
      throw new Error('Language course not found');
    }
    const grammars = await this.findMany({
      language: languageCourse.targetLanguage,
    });
    return { data: grammars };
  }

  async getGrammar(
    user: UserProfileModel,
    grammarId: MongooseSchema.Types.ObjectId | string,
  ): Promise<Grammar> {
    const languageCourse = await this.courseService.getLanguageCourse(user);
    if (!languageCourse) {
      throw new Error('Language course not found');
    }

    const grammar = await this.findOne({
      _id: grammarId,
    });

    if (!grammar.definition) {
      const definition = await this.translatorService.getGrammer(
        grammar.item,
        languageCourse.targetLanguage,
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
    const languageCourse = await this.courseService.getLanguageCourse(user);
    if (!languageCourse) {
      throw new Error('Language course not found');
    }

    const grammar = await this.findOne({
      _id: grammarId,
    });

    const examples = await this.translatorService.getGrammerExamples(
      grammar.item,
      languageCourse.targetLanguage,
    );
    return examples;
  }
}
