import { IsNotEmpty, IsString } from 'class-validator';

export class FileDistanceHtmlRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}