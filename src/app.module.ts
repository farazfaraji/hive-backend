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
import { WordService } from './services/courses/language/word.service';
import { WordSchema } from './schemas/word.schema';
import { Word } from './schemas/word.schema';
import { WordRepository } from './repositories/word.repository';
import { TranslatorService } from './services/translator.service';
import { GrammarService } from './services/courses/language/grammar.service';
import { GrammarRepository } from './repositories/grammar.repository';
import { GrammarController } from './controllers/grammar.controller';
import { LessonService } from './services/courses/language/lesson.service';
import { LessonController } from './controllers/lesson.controller';
import { WordUserService } from './services/courses/language/word-user.service';
import { WordUser, WordUserSchema } from './schemas/word-user.schema';
import { WordUserRepository } from './repositories/word-user.repository';
import { PlanService } from './services/plan.service';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { PlanRepository } from './repositories/plan.repository';
import { PlanController } from './controllers/plan.controller';
import { CourseService } from './services/courses/course.service';
import {
  LanguageCourse,
  LanguageCourseSchema,
} from './schemas/language/language-course.schema';
import { CoursesController } from './controllers/courses.controller';
import { UserService } from './services/user.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { LessonRepository } from './repositories/lesson.repository';
import { Grammar, GrammarSchema } from './schemas/grammar.schema';
import {
  LanguageArticle,
  LanguageArticleSchema,
} from './schemas/language/language-article.schema';
import { LanguageArticleService } from './services/courses/language/language-article.service';
import { LanguageArticleRepository } from './repositories/language-article.repository';
import { LanguageArticleController } from './controllers/language/language-article.controller';
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
      { name: WordUser.name, schema: WordUserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: LanguageCourse.name, schema: LanguageCourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LanguageArticle.name, schema: LanguageArticleSchema },
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
    PlanController,
    CoursesController,
    LanguageArticleController,
  ],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    PlanService,
    WordService,
    LessonService,
    GrammarService,
    TranslatorService,
    UserService,
    CourseService,
    WordUserService,
    LanguageArticleService,
    WordRepository,
    WordUserRepository,
    UserRepository,
    GrammarRepository,
    LessonRepository,
    PlanRepository,
    LanguageArticleRepository,
  ],
})
export class AppModule {}
