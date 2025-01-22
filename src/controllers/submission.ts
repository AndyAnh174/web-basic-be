import { Response } from 'express';
import db from '../config/db';
import { AuthRequest, Submission } from '../types';

export const createSubmission = async (req: AuthRequest, res: Response) => {
  const { files } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
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
    res.json(db.data?.submissions || []);
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
    const userSubmissions = db.data?.submissions.filter(s => s.userId === userId);
    res.json(userSubmissions || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubmissionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await db.read();
    const submission = db.data?.submissions.find(s => s.id === id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 