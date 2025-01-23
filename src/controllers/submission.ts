import { Response } from 'express';
import db from '../config/db';
import { AuthRequest, Submission } from '../types';

export const createSubmission = async (req: AuthRequest, res: Response) => {
  const { files } = req.body as { files: Submission['files'] };
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Validate files
  if (!files.html || !files.css || !files.js) {
    return res.status(400).json({ message: 'All files (HTML, CSS, JS) are required' });
  }

  try {
    await db.read();
    
    const newSubmission: Submission = {
      id: Date.now().toString(),
      userId,
      files,
      submittedAt: new Date(),
      status: 'pending'
    };

    db.data?.submissions.push(newSubmission);
    await db.write();

    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    await db.read();
    const submissions = db.data?.submissions || [];
    
    // Populate user information
    const submissionsWithUser = await Promise.all(
      submissions.map(async (submission) => {
        const user = db.data?.users.find(u => u.id === submission.userId);
        return {
          ...submission,
          user: user ? {
            id: user.id,
            username: user.username,
          } : null,
        };
      })
    );

    res.json(submissionsWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSubmissions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    await db.read();
    const userSubmissions = db.data?.submissions.filter((s: Submission) => s.userId === userId);
    res.json(userSubmissions || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubmissionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  try {
    await db.read();
    const submission = db.data?.submissions.find((s: Submission) => s.id === id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Populate user information
    const user = db.data?.users.find(u => u.id === submission.userId);
    const submissionWithUser = {
      ...submission,
      user: user ? {
        id: user.id,
        username: user.username,
      } : null,
    };

    res.json(submissionWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reviewSubmission = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { feedback } = req.body as { feedback: string };

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can review submissions' });
  }

  try {
    await db.read();
    const submissionIndex = db.data?.submissions.findIndex((s: Submission) => s.id === id);
    
    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (db.data?.submissions[submissionIndex]) {
      db.data.submissions[submissionIndex] = {
        ...db.data.submissions[submissionIndex],
        status: 'reviewed',
        feedback,
      };
      await db.write();
    }

    res.json(db.data?.submissions[submissionIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 