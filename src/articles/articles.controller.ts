import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';
import { filter } from 'rxjs';

@Controller('crawl_data')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('filter')
  async getFiltered(@Query(ValidationPipe) filterDto: FilterArticlesDto) {
    return this.articlesService.findFiltered(filterDto);
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
  async getTotal() {
    return this.articlesService.getTotalArticles();
  }

  @Get(`search`)
  async searchArticles(@Query(ValidationPipe) filterDto: FilterArticlesDto) {
    return this.articlesService.findFiltered(filterDto);
  }
}
