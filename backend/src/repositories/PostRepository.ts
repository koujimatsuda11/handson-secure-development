import { AppDataSource } from '../database/AppDataSource';
import { Post } from '../entities/Post';

export const DEFAULT_LIST_OFFSET = 0;
export const DEFAULT_LIST_LIMIT = 20;

export const PostRepository = AppDataSource.getRepository(Post).extend({
  // here you can extend the repository with custom methods
});
