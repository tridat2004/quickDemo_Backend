import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';

@Controller('crawl_data')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('filter')
  async getFiltered(@Query(ValidationPipe) filterDto: FilterArticlesDto) {
    return this.articlesService.findFiltered(filterDto);
  }

  @Get('search')
  async searchArticles(@Query(ValidationPipe) filterDto: FilterArticlesDto) {
    return this.articlesService.findFiltered(filterDto);
  }

  @Get('total')
  async getTotalArticles() {
    return this.articlesService.getTotalArticles();
  }

  @Get('all-for-stats')
  async getAllForStats() {
    return this.articlesService.getAllForStats();
  }

  @Get('list')
  async getList(@Query('page') page = 1, @Query('limit') limit = 12) {
    return this.articlesService.findFiltered({ 
      page: Number(page), 
      limit: Number(limit) 
    });
  }
}