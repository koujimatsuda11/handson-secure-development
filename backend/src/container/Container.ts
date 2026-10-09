import { IconController } from '../controllers/IconController';
import { LikeController } from '../controllers/LikeController';
import { PostController } from '../controllers/PostController';
import { UserController } from '../controllers/UserController';
import { PostRepository } from '../repositories/PostRepository';
import { StorageClientFactory } from '../repositories/S3Repository';
import { UserRepository } from '../repositories/UserRepository';
import { IconService } from '../services/IconService';
import { PostService } from '../services/PostService';
import { UserService } from '../services/UserService';

export class Container {
  private static controllers = new Map();

  static registerController<T>(key: string, instance: T): void {
    this.controllers.set(key, instance);
  }

  static resolveController<T>(key: string): T {
    const controller = this.controllers.get(key);
    if (!controller) {
      throw new Error(`Controller ${key} not found`);
    }
    return controller;
  }
}

export function initializeControllers(): void {
  // Repository
  const postRepository = PostRepository;
  const userRepository = UserRepository;
  const storageRepository = StorageClientFactory.createStorageRepository();

  // Service
  const iconService = new IconService(storageRepository);
  const postService = new PostService(postRepository, iconService);
  const userService = new UserService(userRepository);

  // Controller
  const postController = new PostController(postService);
  const likeController = new LikeController(postService);
  const userController = new UserController(userService);
  const iconController = new IconController(iconService);

  // Containerに登録
  Container.registerController('postController', postController);
  Container.registerController('likeController', likeController);
  Container.registerController('userController', userController);
  Container.registerController('iconController', iconController);
}
