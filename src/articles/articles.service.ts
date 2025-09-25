import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';
import { getPaginationParams, buildPaginationMeta } from '../common/pagination/pagination.util';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findFiltered(filters: FilterArticlesDto) {
    try {
      const {
        category,
        date,
        search,
        page = 1,
        limit = 10,
        sortBy = 'published_time',
        sortOrder = 'desc',
      } = filters;
      const { skip, take, currentPage, itemsPerPage } = getPaginationParams({ page, limit, maxLimit: 100 });
      const where: any = {};
      if (category) {
        where.category = { contains: category, mode: 'insensitive' };
      }
      if (date) {
        where.published_time = { contains: date, mode: 'insensitive' };
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ];
      }
      const orderBy: any = {};
      const sortableFields = ['id', 'title', 'category', 'published_time', 'url'];
      if (sortBy && sortableFields.includes(sortBy)) {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy['published_time'] = sortOrder;
      }
      const [articles, totalCount] = await Promise.all([
        this.prisma.article.findMany({
          where,
          orderBy,
          skip,
          take,
          select: {
            id: true,
            title: true,
            thumbnail: true,
            category: true,
            published_time: true,
          },
        }),
        this.prisma.article.count({ where }),
      ]);
      const { totalPages, hasNextPage, hasPreviousPage } = buildPaginationMeta({ currentPage, itemsPerPage, totalItems: totalCount });
      return {
        success: true,
        message: 'Articles retrieved successfully',
        data: articles,
        pagination: {
          currentPage,
          totalPages,
          totalItems: totalCount,
          itemsPerPage,
          hasNextPage,
          hasPreviousPage,
        },
        filters: {
          category,
          date,
          search,
          sortBy,
          sortOrder,
        },
      };
    } catch (error) {
      console.error('Error in findFiltered:', error);
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

  async testConnection() {
    try {
      const count = await this.prisma.article.count();
      return {
        success: true,
        message: 'Database connection successful',
        totalArticles: count,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Database connection failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCategories() {
    try {
      const categories = await this.prisma.article.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });

      return {
        success: true,
        data: categories.map((c) => c.category),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve categories',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
