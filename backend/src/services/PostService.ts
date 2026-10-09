import { FindManyOptions } from 'typeorm';
import { BaseService } from './BaseService';
import { PostDto } from '../dtos/PostDto';
import { Post, PostType } from '../entities/Post';
import { User } from '../entities/User';
import { AuthorizationError } from '../errors/AuthorizationError';
import { ValidationError } from '../errors/ValidationError';
import { PostRepository, DEFAULT_LIST_LIMIT, DEFAULT_LIST_OFFSET } from '../repositories/PostRepository';
import { IconService } from './IconService';

export class PostService extends BaseService<
  { postRepository: typeof PostRepository; },
  { iconService: IconService; }
> {
  constructor (postRepository: typeof PostRepository, iconService: IconService) {
    super({ postRepository }, { iconService });
  }

  async findPosts(
    loggedInUserId: number,
    username: string,
    offset?: number,
    limit?: number,
    sortBy?: string,
    sortDir?: 'ASC' | 'DESC',
  ): Promise<PostDto[]> {
    sortBy = sortBy || 'post.posted_at';
    sortDir = sortDir || 'DESC';
    let posts: Post[];
    if (username) {
      posts = await this.repos.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.users', 'users')
        .where(`user.username = '${username}'`)
        .addOrderBy(sortBy, sortDir)
        .skip(offset || DEFAULT_LIST_OFFSET)
        .take(limit || DEFAULT_LIST_LIMIT)
        .getMany();
    } else {
      posts = await this.repos.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.users', 'users')
        .addOrderBy(sortBy, sortDir)
        .skip(offset || DEFAULT_LIST_OFFSET)
        .take(limit || DEFAULT_LIST_LIMIT)
        .getMany();
    }

    return this.toDtos(posts, loggedInUserId);
  }

  async createPost(
    content: string,
    user: User,
  ): Promise<PostDto> {
    const post = new Post();
    post.content = content;
    post.type = PostType.POST;
    post.user = user;
    post.users = [];

    await this.repos.postRepository.save(post);
    return this.toDto(post);
  }

  async updatePost(
    postid: any,
    content: string,
    user: User,
  ): Promise<PostDto> {
    const post = await this.repos.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.users', 'users')
      .where(`post.id = ${postid}`)
      .getOne();

    if (!post) {
      throw new Error(`Post:${postid} not found.`);
    }

    post.content = content;

    await this.repos.postRepository.save(post);
    return this.toDto(post, user.id);
  }

  async deletePost(
    postid: any,
    user: User,
  ): Promise<void> {
    const post = await this.repos.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.users', 'users')
      .where(`post.id = ${postid}`)
      .getOne();

    if (!post) {
      throw new Error(`Post:${postid} not found.`);
    }

    await this.repos.postRepository.remove(post);
  }

  async likePost(
    postid: number,
    user: User,
  ): Promise<number> {
    // if not found, throw EntityNotFoundError
    const post = await this.repos.postRepository.findOneOrFail({
      relations: { users: true },
      where: { id: postid },
    });

    let hasLiked = false;
    for (const owner of post.users) {
      if (owner.id === user.id) {
        hasLiked = true;
        break;
      }
    }

    if (hasLiked) {
      throw new ValidationError(`User:${user.username} has already liked Post:${post.id}.`);
    }

    post.users.push(user);
    await this.repos.postRepository.save(post);

    return post.users.length;
  }

  async unlikePost(
    postid: number,
    user: User,
  ): Promise<number> {
    // if not found, throw EntityNotFoundError
    const post = await this.repos.postRepository.findOneOrFail({
      relations: { users: true },
      where: { id: postid },
    });

    let hasLiked = false;
    post.users = post.users.filter(owner => {
      if (owner.id === user.id) hasLiked = true;
      return owner.id !== user.id;
    });

    if (!hasLiked) {
      throw new ValidationError(`User:${user.username} has not liked Post:${post.id}.`);
    }

    await this.repos.postRepository.save(post);

    return post.users.length;
  }

  private async toDtos(posts: Post[], loggedInUserId?: number): Promise<PostDto[]> {
    const dtos = posts.map(async post => {
      return await this.toDto(post, loggedInUserId);
    });

    return Promise.all(dtos);
  }

  private async toDto(post: Post, loggedInUserId?: number): Promise<PostDto> {
    return {
      id: post.id,
      type: post.type,
      content: post.content,
      user: {
        username: post.user.username,
        nickname: post.user.nickname,
        iconImage: await this.services.iconService.getIcon(post.user.username),
      },
      postedAt: post.posted_at,
      likeCount: post.users.length,
      isLiked: loggedInUserId ? post.users.some((u) => u.id === loggedInUserId) : false,
    };
  }
}
