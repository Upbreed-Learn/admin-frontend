import type {
  BlogType,
  CourseType,
  EditCourseType,
  InstructorType,
  VideosType,
} from '@/lib/constants';
import { https } from '@/lib/https';

const LIMIT = 9;

export const MUTATIONS = {
  authLogin: async function (data: {
    email: string;
    password: string;
    deviceSignature: string;
  }) {
    return await https.post(`/auth/login`, data);
  },
  instructor: async function (data: Omit<InstructorType, 'id' | 'createdAt'>) {
    return await https.post(`/instructor`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  editInstructor: async function (
    id: number,
    data: Omit<InstructorType, 'id' | 'createdAt'>,
  ) {
    return await https.patch(`/instructor/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteInstructor: async function (id: number) {
    return await https.delete(`/instructor/${id}`);
  },
  course: async function (data: CourseType) {
    return await https.post(`/course`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProject: async function (id: number) {
    return await https.delete(`/course/${id}`);
  },
  editProject: async function (id: number, data: EditCourseType) {
    return await https.patch(`/course/${id}`, data);
  },
  editVideos: async function (id: number, data: VideosType) {
    return await https.patch(`/course/${id}/videos`, { videos: data });
  },
  publishBlog: async function (data: Omit<BlogType, 'id'>) {
    return await https.post(`/blog`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteBlog: async function (id: number) {
    return await https.delete(`/blog/${id}`);
  },
  updateBlog: async function (id: number, data: Omit<BlogType, 'id'>) {
    return await https.patch(`/blog/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const QUERIES = {
  getCourses: async function (page?: number, limit?: number, search?: string) {
    limit = limit || LIMIT;
    const params = new URLSearchParams();

    if (page) params.append('page', `${page}`);
    if (limit) params.append('limit', `${limit}`);
    if (search) params.append('query', `${search}`);

    const queryString = params.toString();
    const url =
      queryString && search
        ? `/course/search?${queryString}`
        : queryString && !search
          ? `/course?${queryString}`
          : '/course';

    return await https.get(url);
  },
  getInstructors: async function (
    page?: number,
    limit?: number,
    search?: string,
  ) {
    limit = limit || LIMIT;
    const params = new URLSearchParams();

    if (page) params.append('page', `${page}`);
    if (limit) params.append('limit', `${limit}`);
    if (search) params.append('query', `${search}`);

    const queryString = params.toString();
    const url =
      queryString && search
        ? `/instructor/search?${queryString}`
        : queryString && !search
          ? `/instructor?${queryString}`
          : '/instructor';

    return await https.get(url);
  },
  getInstructor: async function (id: number) {
    return await https.get(`/instructor/${id}`);
  },
  getCategories: async function (page?: number, limit?: number) {
    limit = limit || LIMIT;
    const params = new URLSearchParams();

    if (page) params.append('page', `${page}`);
    if (limit) params.append('limit', `${limit}`);

    const queryString = params.toString();
    const url = `/category?${queryString}`;

    return await https.get(url);
  },
  getCourse: async function (id: number) {
    return await https.get(`/course/${id}`);
  },
  getVideos: async function (id: number) {
    return await https.get(`/course/${id}/video`);
  },
  getBlogs: async function (
    type: 'press' | 'news',
    isPublished: string | null,
    categoryId?: number,
    search?: string,
    page?: number,
    limit?: number,
  ) {
    const defaultLimit = limit || LIMIT;
    const params = new URLSearchParams();

    if (page) params.append('page', `${page}`);
    if (defaultLimit) params.append('limit', `${defaultLimit}`);
    if (search) params.append('search', `${search}`);
    if (type) params.append('type', `${type}`);
    if (isPublished)
      params.append('isPublished', `${isPublished === 'true' ? true : false}`);
    if (categoryId) params.append('categoryId', `${categoryId}`);

    const queryString = params.toString();
    const url = `/blog?${queryString}`;

    return await https.get(url);
  },
  getBlogById: async function (id: number) {
    return await https.get(`/blog/${id}`);
  },
};
