import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }

  // Hàm helper để parse date từ string
  private parseVietnameseDate(dateString: string): Date | null {
    try {
      // Format: "Thứ ba, 23/9/2025, 10:31 (GMT+7)"
      const dateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!dateMatch) return null;

      const [, day, month, year] = dateMatch;

      // Tách lấy phần thời gian nếu có
      const timeMatch = dateString.match(/(\d{1,2}):(\d{2})/);
      let hour = 0, minute = 0;
      if (timeMatch) {
        [, hour, minute] = timeMatch.map(Number);
      }

      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  private formatDateForDisplay(dateString: string): string {
    const date = this.parseVietnameseDate(dateString);
    if (!date) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  async findFiltered(filterDto: FilterArticlesDto) {
    const { searchQuery, category, dateFrom, dateTo, page = 1, limit = 12 } = filterDto;

    const where: any = {};

    // Build search conditions - Search toàn bộ database
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Lấy tất cả articles phù hợp với search và category filter
    let allMatchingArticles = await this.prisma.article.findMany({
      where,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        category: true,
        published_time: true,
      },
    });

    // Filter by date trong memory (vì published_time là string)
    if (dateFrom || dateTo) {
      allMatchingArticles = allMatchingArticles.filter(article => {
        const articleDate = this.parseVietnameseDate(article.published_time);
        if (!articleDate) return false;

        let matchDateFrom = true;
        let matchDateTo = true;

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchDateFrom = articleDate >= fromDate;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchDateTo = articleDate <= toDate;
        }

        return matchDateFrom && matchDateTo;
      });
    }

    // Tính total sau khi filter
    const total = allMatchingArticles.length;

    // Apply pagination AFTER filtering
    const skip = (page - 1) * limit;
    const paginatedArticles = allMatchingArticles.slice(skip, skip + limit);

    // Format published_time cho frontend
    const formattedArticles = paginatedArticles.map(article => ({
      ...article,
      published_time: article.published_time,
      formatted_date: this.formatDateForDisplay(article.published_time)
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      articles: formattedArticles,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getTotalArticles() {
    try {
      const totalCount = await this.prisma.article.count();
      return {
        success: true,
        message: 'Total articles count retrieved successfully',
        totalItems: totalCount,
      };
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

  // Hàm mới: Lấy tất cả articles cho category statistics (không phân trang)
  async getAllForStats() {
    try {
      const articles = await this.prisma.article.findMany({
        select: {
          id: true,
          category: true,
        },
      });

      return {
        success: true,
        articles,
        total: articles.length,
      };
    } catch (error) {
      console.error('Error in getAllForStats:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve articles for statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}