import { IsNotEmpty, IsString } from 'class-validator';
export class NewWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;
}
