import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../schemas/profile.schema';
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from '../services/profile.service';

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/me', async (req, res, next): Promise<void> => {
  try {
    const profile = await getProfile(req.user.id);
    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

profileRouter.patch('/me', async (req, res, next): Promise<void> => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const profile = await updateProfile(req.user.id, input);
    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

profileRouter.put('/me', async (req, res, next): Promise<void> => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const profile = await updateProfile(req.user.id, input);
    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

profileRouter.delete('/me', async (req, res, next): Promise<void> => {
  try {
    await deleteProfile(req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { profileRouter };
