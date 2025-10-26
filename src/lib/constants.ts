// {
//     "email": "xepiy78747@elygifts.com",
//     "id": "2",
//     "fname": "Ross",
//     "lname": "Geller",
//     "roles": [
//         "USER"
//     ],
//     "deviceSignature": "a7b3c9d2-e1f0-4g5h-i6j7-k8l9m0n1o2p3",
//     "iat": 1760721629,
//     "exp": 1768497629
// }

export interface ProjectsType {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface InstructorType {
  id: string;
  fname: string;
  lname: string;
  email: string;
  about: string;
  profilePicture: File;
  createdAt: string;
}

type InstructorProfileType = {
  id: string;
  linkedInUrl: string;
  about: string;
  description: string;
  profilePictureUrl: string;
  expertise: string;
  title: string;
};
export interface InstructorDetailsType {
  id: string;
  fname: string;
  lname: string;
  phone: string;
  email: string;
  password_hash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  instructorProfile: InstructorProfileType;
}

export interface CourseType {
  instructor: number;
  title: string;
  description: string;
  image: File;
  isActive: boolean;
  categories: number[];
}

export type CategoryType = {
  id: string;
  name: string;
};

export type CourseDetailsType = {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  instructor: {
    fname: string;
    lname: string;
  };
  categories: {
    id: number;
    name: string;
  }[];

  tags: [];
  preview: {
    lessonCount: number;
    durationInMinutes: number;
  };
  videos: {
    id: number;
    title: string;
    description: string;
    bunnyVideoId: string;
    isTrailer: boolean;
    isPublic: boolean;
  }[];
};

export type EditCourseType = {
  title: string;
  description: string;
  image?: File;
  categories: number[];
};

export type VideosType = {
  title: string;
  description: string;
  bunnyVideoId: string;
  isTrailer: boolean;
  isPublic: boolean;
}[];

export interface BlogType {
  id: string;
  title: string;
  description: string;
  previewImage: File;
  content: string;
  isPublished: boolean;
  type: 'news' | 'press';
  categoryIds: number[];
}

export type BlogDetailsType = {
  id: number;
  title: string;
  description: string;
  previewImage: string | null;
  content: string;
  isPublished: boolean;
  type: 'news' | 'press';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categories: {
    id: number;
    category: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  }[];
};
