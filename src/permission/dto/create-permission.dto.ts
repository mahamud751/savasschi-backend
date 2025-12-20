import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The name of the permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Array of user IDs associated with the permission',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  users?: string[];
}
