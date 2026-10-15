import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export async function getMyDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.userId;
    const dashboard = await dashboardService.getDashboard(userId);
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
}