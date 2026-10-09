import { BaseService } from '../services/BaseService';

export abstract class BaseController<T extends Record<string, BaseService<any, any>>> {
  constructor(protected services: T) {}
}
