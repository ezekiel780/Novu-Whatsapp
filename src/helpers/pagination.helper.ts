export interface PaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const paginate = <T extends { id: string }>(
  items: T[],
  take: number,
): PaginationResult<T> => {
  const hasMore = items.length === take;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  return { data: items, nextCursor, hasMore };
};

export const getPaginationArgs = (cursor?: string, take = 20) => ({
  take,
  ...(cursor && {
    skip: 1,
    cursor: { id: cursor },
  }),
});
