import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';
import { Language } from 'src/schemas/word.schema';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;

  @IsString()
  @IsNumberString()
  phone: string;

  @IsEnum(Language)
  @IsNotEmpty()
  targetLanguage: Language;

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @IsArray()
  @IsString({ each: true })
  interests: string[];
}
