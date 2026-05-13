import { IsString, IsOptional, IsHexColor, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class AddMemberDto {
  @IsString()
  userId: string;
}
