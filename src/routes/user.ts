import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, createUser } from '../controllers/user';
import { authenticate, requireAdmin } from '../middlewares/auth';

export const userRouter = Router();

// Tất cả các routes đều yêu cầu xác thực và quyền admin
userRouter.use(authenticate, requireAdmin);

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser); 