import { Module } from '@nestjs/common';
import { ScrapersService } from './scrapers.service';
import { RedditAdapter } from './reddit.adapter';
import { YoutubeAdapter } from './youtube.adapter';
import { TwitterAdapter } from './twitter.adapter';
import { BullModule } from '@nestjs/bullmq';
import { DbModule } from '../db/db.module';

import { ScrapersScheduler } from './scrapers.scheduler';

@Module({
  imports: [
    DbModule,
    BullModule.registerQueue({
      name: 'nlp-queue',
    }),
  ],
  providers: [
    ScrapersService,
    RedditAdapter,
    YoutubeAdapter,
    TwitterAdapter,
    ScrapersScheduler,
  ],
  exports: [ScrapersService, ScrapersScheduler],
})
export class ScrapersModule {}
