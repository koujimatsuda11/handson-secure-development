import { z } from 'zod';

// 共通のバリデータ定義

// コンテンツバリデータ（投稿内容用）
export const contentValidator = z.string()
  .min(1, 'Content must not be empty')
  .max(140, 'Content must not exceed 140 characters')
  .regex(/^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}\n\r]*$/u, 'Content contains invalid characters');

// 投稿IDバリデータ
export const postIdValidator = z.number()
  .min(1, 'Post ID must be greater than 0')
  .max(65536, 'Post ID must not exceed 65536');

// ページネーション用のオフセットバリデータ
export const offsetValidator = z.number()
  .min(0, 'Offset must be greater than or equal to 0')
  .max(100000, 'Offset must not exceed 100000')
  .optional();

// ページネーション用のリミットバリデータ
export const limitValidator = z.number()
  .min(0, 'Limit must be greater than or equal to 0')
  .max(100000, 'Limit must not exceed 100000')
  .optional();

// オーナー（ユーザー名）バリデータ
export const ownerValidator = z.string()
  .min(1, 'Owner must not be empty')
  .max(128, 'Owner must not exceed 128 characters')
  .regex(/^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}]*$/u, 'Owner contains invalid characters');

// プロフィールバリデータ
export const profileValidator = z.string()
  .min(1, 'Profile must not be empty')
  .max(160, 'Profile must not exceed 160 characters')
  .regex(/^[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}\n\r]*$/u, 'Profile contains invalid characters');

// アイコン画像バリデータ（Base64エンコード文字列）
export const iconImageValidator = z.string()
  .min(1, 'Icon image must not be empty');

// 共通のページネーションスキーマ
export const paginationSchema = z.object({
  offset: offsetValidator,
  limit: limitValidator,
});

// 型エクスポート
export type ContentType = z.infer<typeof contentValidator>;
export type PostIdType = z.infer<typeof postIdValidator>;
export type OffsetType = z.infer<typeof offsetValidator>;
export type LimitType = z.infer<typeof limitValidator>;
export type OwnerType = z.infer<typeof ownerValidator>;
export type ProfileType = z.infer<typeof profileValidator>;
export type IconImageType = z.infer<typeof iconImageValidator>;
export type PaginationType = z.infer<typeof paginationSchema>;