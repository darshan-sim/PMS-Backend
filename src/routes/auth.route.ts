import { Router } from 'express';
import {
    loginController,
    registerController,
    validateUserInput,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/validate-user', validateUserInput);

export default router;
