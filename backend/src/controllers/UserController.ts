import { NextFunction, Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';

export class UserController extends BaseController<{
  userService: UserService;
}> {
  constructor(userService: UserService) {
    super({ userService });
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileDto = await this.services.userService.getProfile(req.params.owner);

      res.status(200).json(profileDto);
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.body.profileが160文字を超える場合、エラーを投げる
      if (req.body.profile && req.body.profile.length > 160) {
        console.log(`validation error: profile=${req.body.profile}`);
        throw new Error('Profile must be 160 characters or less');
      }

      const profile = await this.services.userService.updateProfile(
        req.user.username,
        req.body.profile,
      );

      res.status(200).json({ profile });
    } catch (err: unknown) {
      next(err as Error);
    }
  }
}
