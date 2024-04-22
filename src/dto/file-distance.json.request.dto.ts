import { IsNotEmpty, IsString } from 'class-validator';

export class FileDistanceJsonRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  file1: string;

  @IsString()
  @IsNotEmpty()
  file2: string;
}