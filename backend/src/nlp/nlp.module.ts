import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { NlpService } from './nlp.service';
import { NlpProcessor } from './nlp.processor';
import { DbModule } from '../db/db.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    DbModule,
    BullModule.registerQueue({
      name: 'nlp-queue',
    }),
  ],
  providers: [GeminiService, NlpService, NlpProcessor],
  exports: [GeminiService, NlpService, NlpProcessor],
})
export class NlpModule {}
