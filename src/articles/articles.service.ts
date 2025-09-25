import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterArticlesDto } from './dto/filter-articles.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findFiltered(filterDto: FilterArticlesDto) {
  const { searchQuery, category, dateFrom, dateTo, page = 1, limit = 100 } = filterDto;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { category: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  if (dateFrom || dateTo) {
  where.published_time = {};

  if (dateFrom) {
    where.published_time.gte = dateFrom; // string
  }
  if (dateTo) {
    where.published_time.lte = dateTo; // string
  }
}



  const [articles, total] = await Promise.all([
    this.prisma.article.findMany({
      where,
      orderBy: { published_time: 'desc' },
      skip,
      take: limit,
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

  return {
  articles,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
  };
}

}
