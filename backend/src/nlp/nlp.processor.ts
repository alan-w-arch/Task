import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NlpService } from './nlp.service';

@Processor('nlp-queue')
export class NlpProcessor extends WorkerHost {
  private readonly logger = new Logger(NlpProcessor.name);

  constructor(private readonly nlpService: NlpService) {
    super();
  }

  async process(job: Job<{ postId: string }, any, string>): Promise<void> {
    const { postId } = job.data;
    this.logger.log(`Processing BullMQ job ${job.id} for post ID: ${postId}`);

    try {
      await this.nlpService.processPost(postId);
      this.logger.log(`Successfully finished processing job ${job.id} for post ID: ${postId}`);
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id} for post ID: ${postId}. Retrying...`, error);
      throw error; // Throwing enables BullMQ's automatic retry logic
    }
  }
}
