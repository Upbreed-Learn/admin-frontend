import { useQuery } from '@tanstack/react-query';
import { QUERIES } from '.';

export const useGetCourses = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['courses', { page, limit }],
    queryFn: () => QUERIES.getCourses(page, limit),
  });
};

export const useGetInstructors = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['instructors', { page, limit }],
    queryFn: () => QUERIES.getInstructors(page, limit),
  });
};

export const useGetCategories = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => QUERIES.getCategories(page, limit),
  });
};

export const useGetCourse = (id: string) => {
  return useQuery({
    queryKey: ['courses', { id }],
    queryFn: () => QUERIES.getCourse(+id),
    enabled: !!id,
  });
};
