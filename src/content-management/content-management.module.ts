import { Module } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentManagementController],
  providers: [ContentManagementService],
  exports: [ContentManagementService],
})
export class ContentManagementModule {}
