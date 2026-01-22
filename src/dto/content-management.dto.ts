import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateContentDto {
  @ApiProperty({ required: true, description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ required: true, description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ required: true, description: 'Company Name' })
  @IsString()
  companyName: string;

  @ApiProperty({ required: true, description: 'Content date' })
  @IsDateString()
  date: string;

  @ApiProperty({ required: false, description: 'Content title' })
  @IsString()
  @IsOptional()
  contentTitle?: string;

  @ApiProperty({ required: false, description: 'Occasion' })
  @IsString()
  @IsOptional()
  occasion?: string;

  @ApiProperty({ required: true, description: 'Caption' })
  @IsString()
  caption: string;

  @ApiProperty({
    required: false,
    description: 'Tags array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, description: 'Internal comments' })
  @IsString()
  @IsOptional()
  internalComments?: string;

  @ApiProperty({
    required: false,
    description: 'Content status',
    enum: ['draft', 'approved', 'rejected', 'published'],
  })
  @IsEnum(['draft', 'approved', 'rejected', 'published'])
  @IsOptional()
  status?: string;
}

export class UpdateContentDto {
  @ApiProperty({ required: false, description: 'User ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false, description: 'Company ID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false, description: 'Company Name' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ required: false, description: 'Content date' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ required: false, description: 'Content title' })
  @IsString()
  @IsOptional()
  contentTitle?: string;

  @ApiProperty({ required: false, description: 'Occasion' })
  @IsString()
  @IsOptional()
  occasion?: string;

  @ApiProperty({ required: false, description: 'Caption' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({
    required: false,
    description: 'Tags array',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, description: 'Internal comments' })
  @IsString()
  @IsOptional()
  internalComments?: string;

  @ApiProperty({
    required: false,
    description: 'Content status',
    enum: ['draft', 'approved', 'rejected', 'published'],
  })
  @IsEnum(['draft', 'approved', 'rejected', 'published'])
  @IsOptional()
  status?: string;
}
