import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ScrapersModule } from '../scrapers/scrapers.module';
import { NlpModule } from '../nlp/nlp.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, ScrapersModule, NlpModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
