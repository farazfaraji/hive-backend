import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { WordController } from './controllers/word.controller';
import { WordService } from './services/word.service';
import { WordSchema } from './schemas/word.schema';
import { Word } from './schemas/word.schema';
import { WordRepository } from './repositories/word.repository';
import { TranslatorService } from './services/translator.service';
import { GrammarService } from './services/grammar.service';
import { GrammarRepository } from './repositories/grammar.repository';
import { Grammar, GrammarSchema } from './schemas/grammar.schema';
import { GrammarController } from './controllers/grammar.controller';
import { LessonService } from './services/lesson.service';
import { LessonController } from './controllers/lesson.controller';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { ProgressService } from './services/progress.service';
import { ProgressRepository } from './repositories/progress.repository';
import { WordUserService } from './services/word-user.service';
import { WordUser, WordUserSchema } from './schemas/word-user.schema';
import { WordUserRepository } from './repositories/word-user.repository';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.env.NODE_ENV || ''}.env`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        authSource: 'admin',
        retryWrites: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Word.name, schema: WordSchema },
      { name: Grammar.name, schema: GrammarSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: WordUser.name, schema: WordUserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    WordController,
    LessonController,
    GrammarController,
  ],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    WordService,
    LessonService,
    ProgressService,
    GrammarService,
    TranslatorService,
    WordUserService,
    WordRepository,
    WordUserRepository,
    UserRepository,
    GrammarRepository,
    ProgressRepository,
  ],
})
export class AppModule {}
