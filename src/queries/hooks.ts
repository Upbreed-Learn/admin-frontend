import { useQuery } from '@tanstack/react-query';
import { QUERIES } from '.';

export const useGetCourses = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['courses', { page, limit }],
    queryFn: () => QUERIES.getCourses(page, limit),
  });
};
