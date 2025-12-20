import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID of the order related to the notification' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Email of the user to send notification' })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({ description: 'Custom message for the notification' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    description: 'Status of the demo',
    enum: ['read', 'unread'],
  })
  @IsEnum(['read', 'unread'])
  @IsOptional()
  status?: string;
}

export class UpdateNotificationStatusDto {
  @ApiProperty({
    description: 'Status of the notification, either "unread" or "read"',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
