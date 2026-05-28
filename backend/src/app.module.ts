import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { DbModule } from './db/db.module';
import { NlpModule } from './nlp/nlp.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { PostsModule } from './posts/posts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    // Load .env configuration globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Enable cron-based schedules
    ScheduleModule.forRoot(),

    // Configure BullMQ Redis connections
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),

    // Custom modules
    DbModule,
    NlpModule,
    ScrapersModule,
    PostsModule,
    AnalyticsModule,
    ExportModule,
  ],
})
export class AppModule {}
