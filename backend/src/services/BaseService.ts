export abstract class BaseService<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
> {
  constructor(
    protected repos: T,
    protected services: U,
  ) {}
}
