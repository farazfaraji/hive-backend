import { IsBoolean, IsOptional } from 'class-validator';

export class AcceptDto {
  @IsBoolean()
  status: boolean;

  @IsOptional()
  message?: string;
}
