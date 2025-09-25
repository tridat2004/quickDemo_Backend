export interface PaginationParams {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationValues {
  skip: number;
  take: number;
  currentPage: number;
  itemsPerPage: number;
}

export function getPaginationParams({ page = 1, limit = 10, maxLimit = 100 }: PaginationParams): PaginationValues {
  const safePage = Math.max(1, Number.isFinite(page) ? page : 1);
  const safeLimitRaw = Number.isFinite(limit) ? limit : 10;
  const safeLimit = Math.max(1, Math.min(safeLimitRaw, maxLimit));
  const skip = (safePage - 1) * safeLimit;
  return {
    skip,
    take: safeLimit,
    currentPage: safePage,
    itemsPerPage: safeLimit,
  };
}

export interface PaginationMetaInput {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export function buildPaginationMeta({ currentPage, itemsPerPage, totalItems }: PaginationMetaInput) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage || 1));
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
