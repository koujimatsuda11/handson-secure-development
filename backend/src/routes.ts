import { Application } from 'express';
import { authenticateToken, optionalAuth } from './middlewares/cognitoAuth';
import { requireScope } from './middlewares/scopeAuth';
import { Container, initializeControllers } from './container/Container';
import { IconController } from './controllers/IconController';
import { LikeController } from './controllers/LikeController';
import { PostController } from './controllers/PostController';
import { UserController } from './controllers/UserController';

export function routes(app: Application): void {
  initializeControllers();
  postRoutes(app);
  likeRoutes(app);
  userRoutes(app);
  iconRoutes(app);
}

function postRoutes(app: Application): void {
  const postController = Container.resolveController<PostController>('postController');

  app.get('/api/posts', authenticateToken,  postController.getPosts.bind(postController));
  app.get('/api/posts/:owner', authenticateToken, postController.getOwnerPosts.bind(postController));
  app.post('/api/posts', authenticateToken,  postController.postPost.bind(postController));
  app.put('/api/posts/:postid', authenticateToken,  postController.updatePost.bind(postController));
  app.delete('/api/posts/:postid', authenticateToken, postController.deletePost.bind(postController));
}

function likeRoutes(app: Application): void {
  const likeController = Container.resolveController<LikeController>('likeController');

  app.post('/api/likes', authenticateToken, likeController.likePost.bind(likeController));
  app.delete('/api/likes/:postid', authenticateToken, likeController.unlikePost.bind(likeController));
}

function userRoutes(app: Application): void {
  const userController = Container.resolveController<UserController>('userController');

  app.get('/api/profiles/:owner', authenticateToken,  userController.getProfile.bind(userController));
  app.put('/api/profiles', authenticateToken,  userController.updateProfile.bind(userController));
}

function iconRoutes(app: Application): void {
  const iconController = Container.resolveController<IconController>('iconController');

  app.get('/api/icons/:owner', authenticateToken, iconController.getIcon.bind(iconController));
  app.put('/api/icons', authenticateToken, iconController.updateIcon.bind(iconController));
}
