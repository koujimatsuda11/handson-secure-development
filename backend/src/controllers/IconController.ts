import { NextFunction, Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IconService } from '../services/IconService';

export class IconController extends BaseController<{
  iconService: IconService;
}> {
  constructor(iconService: IconService) {
    super({ iconService });
  }

  async getIcon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const iconImage = await this.services.iconService.getIcon(req.params.owner);

      res.status(200).json({ iconImage });
    } catch (err: unknown) {
      next(err as Error);
    }
  }

  async updateIcon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const iconImage = await this.services.iconService.updateIcon(
        req.user.username,
        req.body.iconImage,
      );

      res.status(200).json({ iconImage });
    } catch (err: unknown) {
      next(err as Error);
    }
  }
}
