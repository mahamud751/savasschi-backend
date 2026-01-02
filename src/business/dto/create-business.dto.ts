import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ description: 'User ID who creates the business' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Business name' })
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @ApiPropertyOptional({ description: 'Industry type' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ description: 'Task title' })
  @IsNotEmpty()
  @IsString()
  taskTitle: string;

  @ApiPropertyOptional({ description: 'Description of the business task' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Array of attachment URLs' })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}
