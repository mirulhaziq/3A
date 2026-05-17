import { Request, Response, NextFunction } from 'express';

function sseHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  next();
}

export { sseHeaders };
