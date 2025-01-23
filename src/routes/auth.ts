import { Router } from 'express';
import { login, refresh, logout } from '../controllers/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout); 