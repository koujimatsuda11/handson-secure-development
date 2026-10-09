import { NextFunction, Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PostService } from '../services/PostService';

export class LikeController extends BaseController<{
  postService: PostService;
}> {
  constructor(postService: PostService) {
    super({ postService });
  }

  async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const likeCount = await this.services.postService.likePost(Number(req.body.postid), req.user);

      res.status(201).json({ likeCount, isLiked: true });
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const likeCount = await this.services.postService.unlikePost(Number(req.params.postid), req.user);

      res.status(200).json({ likeCount, isLiked: false });
    } catch (err: unknown) {
      next(err as Error);
    }
  }
}
