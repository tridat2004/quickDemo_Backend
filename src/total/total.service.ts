import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TotalService {
  constructor(private prisma: PrismaService) {}

  async getTotalArticles() {
    try {
      const totalCount = await this.prisma.article.count();
      return { total: totalCount };
    } catch (error) {
      console.error('Error in getTotalArticles:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve total article count',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const articles = await this.prisma.article.findMany({
        orderBy: { published_time: 'desc' }, // tùy chọn sắp xếp mới nhất lên đầu
      });
      return { articles }; // trả về object { articles: [...] }
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve articles',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
