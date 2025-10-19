import { https } from '@/lib/https';

export const MUTATIONS = {
  authLogin: async function (data: {
    email: string;
    password: string;
    deviceSignature: string;
  }) {
    return await https.post(`/auth/login`, data);
  },
};

export const QUERIES = {
  getCourses: async function (page?: number, limit?: number) {
    limit = limit || 9;
    const params = new URLSearchParams();

    if (page) params.append('page', `${page}`);
    if (limit) params.append('limit', `${limit}`);

    const queryString = params.toString();
    const url = queryString ? `/course?${queryString}` : '/course';

    return await https.get(url);
  },
};
