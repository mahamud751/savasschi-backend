import {
  IsOptional,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PhotoDto } from 'src/dto/photoDto';

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The address of the user', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'The phone number of the user', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'The status of the user',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Array of photo objects',
    type: [PhotoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  @IsOptional()
  photos?: PhotoDto[];

  @ApiPropertyOptional({
    description: 'Array of permission IDs',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}
