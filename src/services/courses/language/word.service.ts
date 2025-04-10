import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from 'src/abstracts/service.abstract';
import { WordRepository } from 'src/repositories/word.repository';
import { Word, WordDocument } from 'src/schemas/word.schema';
import { UserProfileModel } from '../../auth.service';
import { NewWordDto } from 'src/dtos/word/new-word.dto';
import { v4 as uuidv4 } from 'uuid';
import { TranslatorService } from '../../translator.service';
import { getTranslationResponse } from 'src/controllers/word.controller';
import { WordUserService } from './word-user.service';
import { Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class WordService extends AbstractService<Word, WordDocument> {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly wordUserService: WordUserService,
    private readonly repository: WordRepository,
  ) {
    super(repository.getTarget());
  }

  async createWord(user: UserProfileModel, word: NewWordDto) {
    const res = await this.insertIfNotExist(['word'], {
      ...word,
      language: user.language,
      uniqueId: uuidv4(),
    });
    if (res.exist) {
      return {
        message: 'Word already exists',
        word: res.data,
      };
    }

    await this.wordUserService.create(user, {
      wordId: res.data._id as MongooseSchema.Types.ObjectId,
      uniqueId: res.data.uniqueId,
    });

    return res.data;
  }

  async getTranslation(
    user: UserProfileModel,
    wordId: string,
  ): Promise<getTranslationResponse> {
    const word = await this.findOne({
      uniqueId: wordId,
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${wordId} not found`);
    }

    if (word.translation) {
      return {
        uniqueId: word.uniqueId,
        word: word.word,
        example: word.example,
        meaning: word.meaning,
        synonyms: word.synonyms,
        contexts: word.contexts,
        translation: word.translation,
      };
    }

    try {
      const translation = await this.translatorService.translate(
        word.word,
        user.level.toString(),
        user.targetLanguage,
        user.language,
      );

      await this.updateOne(
        { uniqueId: wordId },
        {
          translation: translation.translation,
          meaning: translation.meaning,
          example: translation.example,
          synonyms: translation.synonyms,
          contexts: translation.contexts,
        },
      );

      return {
        uniqueId: word.uniqueId,
        word: word.word,
        example: translation.example,
        meaning: translation.meaning,
        synonyms: translation.synonyms,
        contexts: translation.contexts,
        translation: translation.translation,
      };
    } catch (error) {
      throw new Error(`Failed to translate word: ${error.message}`);
    }
  }

  async getCandidateWord(user: UserProfileModel) {
    const userWord = await this.wordUserService.getCandidate(user);
    if (!userWord) {
      throw new NotFoundException('No candidate words found');
    }
    const word = await this.findOne({ _id: userWord.wordId });
    return this.getTranslation(user, word.uniqueId);
  }

  async acknowledgeWord(user: UserProfileModel, wordId: string) {
    await this.wordUserService.acknowledge(user, wordId);
  }

  async tryLaterWord(user: UserProfileModel, wordId: string) {
    const fifteenMinutesLater = new Date(Date.now() + 15 * 60 * 1000);
    await this.wordUserService.tryLater(user, wordId, fifteenMinutesLater);
  }
}
