import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.post('/languages', adminController.createLanguage);
router.post('/courses', adminController.createCourse);
router.post('/modules', adminController.createModule);
router.post('/lessons', adminController.createLesson);
router.post('/quizzes', adminController.createQuiz);
router.get('/users', adminController.getAllUsers);
router.get('/analytics', adminController.getAnalytics);

export default router;