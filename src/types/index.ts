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
    html?: string;
    css?: string;
    js?: string;
  };
  submittedAt: Date;
  status: 'pending' | 'reviewed';
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    role: string;
  };
} 