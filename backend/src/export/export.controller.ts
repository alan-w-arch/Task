import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { Response } from 'express';
import { Platform, Sentiment, Category } from 'shared';

@ApiTags('export')
@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  @ApiOperation({ summary: 'Export filtered posts to CSV' })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'sentiment', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'minEngagement', required: false })
  @ApiQuery({ name: 'timeRangeHours', required: false })
  @ApiQuery({ name: 'search', required: false })
  async exportCsv(
    @Res() res: Response,
    @Query('platform') platform?: Platform,
    @Query('category') category?: Category,
    @Query('language') language?: string,
    @Query('sentiment') sentiment?: Sentiment,
    @Query('region') region?: string,
    @Query('minEngagement') minEngagement?: string,
    @Query('timeRangeHours') timeRangeHours?: string,
    @Query('search') search?: string
  ) {
    const csvData = await this.exportService.exportToCsv({
      platform,
      category,
      language,
      sentiment,
      region,
      minEngagement: minEngagement ? parseInt(minEngagement, 10) : undefined,
      timeRangeHours: timeRangeHours ? parseInt(timeRangeHours, 10) : undefined,
      search,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=social_posts_export.csv');
    res.status(200).send(csvData);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Export filtered posts report to PDF' })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'sentiment', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'minEngagement', required: false })
  @ApiQuery({ name: 'timeRangeHours', required: false })
  @ApiQuery({ name: 'search', required: false })
  async exportPdf(
    @Res() res: Response,
    @Query('platform') platform?: Platform,
    @Query('category') category?: Category,
    @Query('language') language?: string,
    @Query('sentiment') sentiment?: Sentiment,
    @Query('region') region?: string,
    @Query('minEngagement') minEngagement?: string,
    @Query('timeRangeHours') timeRangeHours?: string,
    @Query('search') search?: string
  ) {
    await this.exportService.exportToPdf(
      {
        platform,
        category,
        language,
        sentiment,
        region,
        minEngagement: minEngagement ? parseInt(minEngagement, 10) : undefined,
        timeRangeHours: timeRangeHours ? parseInt(timeRangeHours, 10) : undefined,
        search,
      },
      res
    );
  }
}
