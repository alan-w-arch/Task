import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapersService } from './scrapers.service';

@Injectable()
export class ScrapersScheduler {
  private readonly logger = new Logger(ScrapersScheduler.name);

  constructor(private readonly scrapersService: ScrapersService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Triggering automated hourly social media scraping cron job...');
    try {
      await this.scrapersService.scrapeAll();
    } catch (error) {
      this.logger.error('Error during scheduled scraper run:', error);
    }
  }
}
