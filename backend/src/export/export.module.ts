import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [PostsModule],
  providers: [ExportService],
  controllers: [ExportController],
  exports: [ExportService],
})
export class ExportModule {}
