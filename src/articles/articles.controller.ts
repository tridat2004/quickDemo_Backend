import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';

interface TotalResponse{
  total: number;
}
interface ArticlesResponse{
  articles: any[];
  total: number;
  page: number;
  limit: number;
}
@Controller('crawl_data')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('filter')
  async getFiltered(
      @Query(ValidationPipe) filterDto: FilterArticlesDto,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 6,
    ): Promise<{
      articles: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    }> {
      return this.articlesService.findFiltered({ ...filterDto, page, limit });
}

  @Get('test')
  async testConnection() {
    return this.articlesService.testConnection();
  }

  @Get('categories')
  async getCategories() {
    return this.articlesService.getCategories();
  }

  @Get('total')
  async getTotal(): Promise<{total: number}>{
    return this.articlesService.getTotalArticles();
  }
}
