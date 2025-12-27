
export interface Teacher {
  name: string;
  school: string;
  email: string;
  phone: string;
  role: string;
  note: string;
}

export interface SubjectResult {
  subject: 'Physics' | 'Chemistry' | 'Biology';
  teachers: Teacher[];
}

export interface SearchResponse {
  physics: Teacher[];
  chemistry: Teacher[];
  biology: Teacher[];
  sources: Array<{ title: string; uri: string }>;
}

export enum Subject {
  PHYSICS = 'פיזיקה',
  CHEMISTRY = 'כימיה',
  BIOLOGY = 'ביולוגיה'
}
