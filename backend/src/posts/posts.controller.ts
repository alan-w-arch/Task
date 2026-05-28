import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { ScrapersService } from '../scrapers/scrapers.service';
import { Platform, Sentiment, Category, LanguageCode } from 'shared';

class TranslateDto {
  postId: string;
  language: LanguageCode;
}

@ApiTags('posts')
@Controller('api')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly scrapersService: ScrapersService
  ) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get all processed social posts with filters and search' })
  @ApiQuery({ name: 'platform', required: false, enum: ['reddit', 'youtube', 'twitter'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'sentiment', required: false, enum: ['positive', 'neutral', 'negative'] })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'minEngagement', type: Number, required: false })
  @ApiQuery({ name: 'timeRangeHours', type: Number, required: false })
  @ApiQuery({ name: 'isGibberish', type: Boolean, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'clusterId', required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['created_at', 'engagement_score'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getPosts(
    @Query('platform') platform?: Platform,
    @Query('category') category?: Category,
    @Query('language') language?: string,
    @Query('sentiment') sentiment?: Sentiment,
    @Query('region') region?: string,
    @Query('minEngagement') minEngagement?: string,
    @Query('timeRangeHours') timeRangeHours?: string,
    @Query('isGibberish') isGibberish?: string,
    @Query('search') search?: string,
    @Query('clusterId') clusterId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'created_at' | 'engagement_score',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    return this.postsService.getPosts({
      platform,
      category,
      language,
      sentiment,
      region,
      clusterId,
      minEngagement: minEngagement ? parseInt(minEngagement, 10) : undefined,
      timeRangeHours: timeRangeHours ? parseInt(timeRangeHours, 10) : undefined,
      isGibberish: isGibberish === 'true' ? true : isGibberish === 'false' ? false : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy,
      sortOrder
    });
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get details of a post including cache and cluster siblings' })
  async getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate a post into one of the 10 target languages' })
  async translatePost(@Body() translateDto: TranslateDto) {
    const translatedText = await this.postsService.translatePost(
      translateDto.postId,
      translateDto.language
    );
    return { translatedText };
  }

  @Post('posts/scrape')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force execution of scrapers manually' })
  async triggerScrape() {
    this.logger.log('Manual scrape triggered via API');
    const result = await this.scrapersService.scrapeAll();
    return {
      message: 'Scraping job executed successfully.',
      ...result
    };
  }
}
