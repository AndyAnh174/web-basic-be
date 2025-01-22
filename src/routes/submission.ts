import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { 
  createSubmission,
  getAllSubmissions,
  getUserSubmissions,
  getSubmissionById
} from '../controllers/submission';

export const submissionRouter = Router();

// User routes
submissionRouter.post('/', authenticate, createSubmission);
submissionRouter.get('/my-submissions', authenticate, getUserSubmissions);

// Admin routes
submissionRouter.get('/', authenticate, requireAdmin, getAllSubmissions);
submissionRouter.get('/:id', authenticate, requireAdmin, getSubmissionById); 