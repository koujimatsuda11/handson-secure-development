import { NextFunction, Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PostService } from '../services/PostService';

export class PostController extends BaseController<{
  postService: PostService;
}> {
  constructor(postService: PostService) {
    super({ postService });
  }

  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postDtos = await this.services.postService.findPosts(
        req.user.id,
        '',
        Number(req.query.offset),
        Number(req.query.limit),
      );

      res.status(200).json({ Items: postDtos });
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async getOwnerPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postDtos = await this.services.postService.findPosts(
        req.user.id,
        req.params.owner,
        Number(req.query.offset),
        Number(req.query.limit),
      );

      res.status(200).json({ Items: postDtos });
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async postPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postDto = await this.services.postService.createPost(
        req.body.content,
        req.user,
      );

      res.status(201).json(postDto);
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postDtos = await this.services.postService.updatePost(
        Number(req.params.postid),
        req.body.content,
        req.user,
      );

      res.status(200).json(postDtos);
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.services.postService.deletePost(Number(req.params.postid), req.user);

      res.status(204).json({});
    } catch (err: unknown) {
      next(err as Error);
    }
  }
}
