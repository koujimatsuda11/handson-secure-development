import { BaseService } from './BaseService';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { logger } from '../helpers/logger';
import { fetchUserInfoFromCognitoViaGetUser } from '../helpers/cognito';
import { ProfileDto } from '../dtos/ProfileDto';

export class UserService extends BaseService<
  { userRepository: typeof UserRepository; },
  {}
> {
  constructor (
    userRepository: typeof UserRepository,
  ) {
    super({ userRepository }, {});
  }

  async getOrSaveUserByPayload(payload: CognitoAccessTokenPayload, accessToken?: string): Promise<User> {
    try {
      // まず既存ユーザーを確認
      const existingUser = await this.repos.userRepository.findOneBy({ cognito_sub: payload.sub });
      if (existingUser) {
        if (accessToken) {
          try {
            const userInfo = await this.fetchUserInfoFromCognito(accessToken);
            const nickname = this.normalizeNickname(userInfo.nickname);
            if (existingUser.nickname !== nickname) {
              existingUser.nickname = nickname;
              await this.repos.userRepository.save(existingUser);
            }
          } catch (error) {
            logger.info({
              sub: payload.sub,
              error,
              msg: '既存ユーザーのnickname更新をスキップします'
            });
          }
        }
        logger.info({ sub: payload.sub, username: existingUser.username }, '既存ユーザーを発見');
        return existingUser;
      }

      // ユーザー情報を準備
      let username: string;
      let email: string | null = null;
      let nickname: string | null = null;

      // accessTokenが提供されている場合、UserInfo APIから詳細情報を取得
      if (accessToken) {
        logger.info('accessTokenが提供されました、UserInfo APIを呼び出します');
        try {
          const userInfo = await this.fetchUserInfoFromCognito(accessToken);
          username = userInfo.username || payload.sub;
          email = userInfo.email || null;
          nickname = this.normalizeNickname(userInfo.nickname);
        } catch (error) {
          logger.info({ 
            sub: payload.sub,
            error: error,
            msg: 'UserInfo取得エラー、デフォルト値を使用します'
          });
          // UserInfo取得に失敗した場合のフォールバック
          username = typeof payload.username === 'string' ? payload.username : payload.sub;
          email = typeof payload.email === 'string' ? payload.email : null;
          nickname = this.normalizeNickname((payload as Record<string, unknown>).nickname);
        }
      } else {
        logger.info('accessTokenが提供されていません、デフォルト値を使用');
        // accessTokenが提供されていない場合のフォールバック
        username = typeof payload.username === 'string' ? payload.username : payload.sub;
        email = typeof payload.email === 'string' ? payload.email : null;
        nickname = this.normalizeNickname((payload as Record<string, unknown>).nickname);
      }

      // UpsertでUser作成（競合状態でも安全）
      logger.info({ sub: payload.sub }, '新規ユーザー作成開始（Upsert使用）');
      
      const result = await this.repos.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          cognito_sub: payload.sub,
          username: username,
          email: email,
          nickname: nickname,
        })
        .orIgnore() // MySQL: ON DUPLICATE KEY IGNORE / PostgreSQL: ON CONFLICT DO NOTHING
        .execute();

      // 作成されたかどうかに関係なく、最新のユーザー情報を取得して返す
      const user = await this.repos.userRepository.findOneBy({ cognito_sub: payload.sub });
      if (!user) {
        throw new Error(`User creation failed for sub: ${payload.sub}`);
      }
      return user;

    } catch (error) {
      // 最後の安全策として、もう一度検索を試行
      const fallbackUser = await this.repos.userRepository.findOneBy({ cognito_sub: payload.sub });
      if (fallbackUser) {
        logger.info({ sub: payload.sub, username: fallbackUser.username }, 'フォールバック検索で既存ユーザーを発見');
        return fallbackUser;
      }
      
      // それでも見つからない場合は元のエラーを再スロー
      throw error;
    }
  };

  /**
   * AWS SDK GetUser APIからユーザー情報を取得（VPCエンドポイント経由）
   */
  private async fetchUserInfoFromCognito(accessToken: string): Promise<any> {
    const region = process.env.AWS_REGION || 'ap-northeast-1';

    try {
      const userInfo = await fetchUserInfoFromCognitoViaGetUser(accessToken, {
        region,
        endpoint: process.env.COGNITO_ENDPOINT,
      });

      const attributes = {
        ...userInfo.attributes,
        username: userInfo.username,
      };

      logger.info({ attributes: Object.keys(attributes) }, 'GetUser APIからユーザー情報を取得しました');
      return attributes;
    } catch (error) {
      logger.error({ error }, 'GetUser API呼び出しエラー');
      throw error;
    }
  }

  private normalizeNickname(nickname: unknown): string | null {
    if (typeof nickname !== 'string') {
      return null;
    }

    const trimmedNickname = nickname.trim();
    return trimmedNickname || null;
  }

  async getProfile(username: string): Promise<ProfileDto> {
    // if not found, throw EntityNotFoundError
    const user = await this.repos.userRepository.findOneOrFail({
      where: { username },
    });

    return {
      username: user.username,
      nickname: user.nickname,
      profile: user.profile ?? '',
    };
  }

  async updateProfile(username: string, profile: string): Promise<string> {
    // if not found, throw EntityNotFoundError
    const user = await this.repos.userRepository.findOneOrFail({
      where: { username },
    });

    user.profile = profile;
    await this.repos.userRepository.save(user);

    return profile;
  }
}
