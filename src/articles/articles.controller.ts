import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';

@Controller('crawl_data')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('filter')
  async getFiltered(
    @Query(ValidationPipe) filterDto: FilterArticlesDto,
  ) {
    return this.articlesService.findFiltered(filterDto);
  }
}
