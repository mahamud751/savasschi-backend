import { Module } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';

@Module({
  controllers: [ContentManagementController],
  providers: [ContentManagementService],
  exports: [ContentManagementService],
})
export class ContentManagementModule {}
