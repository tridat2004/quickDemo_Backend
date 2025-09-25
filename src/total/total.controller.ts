import { Controller, Get } from '@nestjs/common';
import { TotalService } from './total.service';

@Controller('crawl_data')
export class TotalController {
  constructor(private readonly totalService: TotalService) {}

  @Get('total')
  async getTotal() {
    return this.totalService.getTotalArticles();
  }
  @Get('list')
async getAllArticles() {
  return this.totalService.findAll(); 
}

}