import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Interests } from 'src/constants/courses.constant';
import { Language } from 'src/schemas/word.schema';
export class CreateLanguageCourseDto {
  @IsEnum(Interests, { each: true })
  @IsArray()
  interests: (typeof Interests)[number][];

  @IsEnum(Language)
  @IsNotEmpty()
  mainLanguage: Language;

  @IsEnum(Language)
  @IsNotEmpty()
  targetLanguage: Language;

  @IsOptional()
  examType: string;
}
