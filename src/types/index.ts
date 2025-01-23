import { Request } from 'express';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Submission {
  id: string;
  userId: string;
  files: {
    html?: {
      name: string;
      content: string;
    };
    css?: {
      name: string;
      content: string;
    };
    js?: {
      name: string;
      content: string;
    };
  };
  submittedAt: Date;
  status: 'pending' | 'reviewed';
  feedback?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
} 