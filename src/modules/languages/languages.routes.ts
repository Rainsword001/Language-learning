import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as languagesController from './languages.controller';

const router = Router();

router.get('/languages', authenticate, languagesController.getLanguages);
router.get('/language-pairs', authenticate, languagesController.getLanguagePairs);
router.post('/users/me/language-pair', authenticate, languagesController.setMyLanguagePair);
router.get('/courses', authenticate, languagesController.getCourses);
router.get('/courses/:courseId/modules', authenticate, languagesController.getCourseModules);
router.get('/lessons/:lessonId', authenticate, languagesController.getLesson);

export default router;