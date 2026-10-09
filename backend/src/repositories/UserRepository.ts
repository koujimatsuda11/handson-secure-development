import { AppDataSource } from '../database/AppDataSource';
import { User } from '../entities/User';

export const UserRepository = AppDataSource.getRepository(User).extend({
  // here you can extend the repository with custom methods
});
