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
  description: string;
  image: string;
  createdAt: string;
}
