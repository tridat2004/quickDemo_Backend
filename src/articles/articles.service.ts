import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';
import { getPaginationParams, buildPaginationMeta } from '../common/pagination/pagination.util';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }


  // Hàm helper để parse date từ string
  private parseVietnameseDate(dateString: string): Date | null {
    try {
      // Format: "Thứ ba, 23/9/2025, 10:31 (GMT+7)"
      // Tách lấy phần ngày tháng
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
    const { searchQuery, category, dateFrom, dateTo, page = 1, limit = 100 } = filterDto;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Build search conditions
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Get all articles first
    let allArticles = await this.prisma.article.findMany({
      where: searchQuery || category ? where : {},
      orderBy: { id: 'desc' }, // Sắp xếp theo id thay vì published_time
      select: {
        id: true,
        title: true,
        thumbnail: true,
        category: true,
        published_time: true,
      },
    });

    // Filter by date in memory (since published_time is string)
    if (dateFrom || dateTo) {
      allArticles = allArticles.filter(article => {
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
          toDate.setHours(23, 59, 59, 999); // End of day
          matchDateTo = articleDate <= toDate;
        }

        return matchDateFrom && matchDateTo;
      });
    }


    // Format published_time cho frontend
    const formattedArticles = allArticles.map(article => ({
      ...article,
      published_time: article.published_time, // Giữ nguyên format gốc
      formatted_date: this.formatDateForDisplay(article.published_time) // Thêm field mới
    }));

    // Apply pagination
    const total = formattedArticles.length;
    const paginatedArticles = formattedArticles.slice(skip, skip + limit);

    return {
      articles: paginatedArticles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
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
}

