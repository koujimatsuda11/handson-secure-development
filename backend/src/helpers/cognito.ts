import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

/**
 * Cognito GetUser でユーザー情報を取得（SRP 前提）
 * - 引数の accessToken は USER_SRP_AUTH のサインインで取得したものを渡す
 * - /oauth2/userInfo は使わない
 */
export async function fetchUserInfoFromCognitoViaGetUser(
  accessToken: string,
  opts: {
    region?: string; // 未指定なら環境変数 AWS_REGION / AWS_DEFAULT_REGION を利用
    endpoint?: string;
  } = {}
): Promise<{
  sub?: string;
  username?: string;
  attributes: Record<string, string>;
  mfa?: {
    preferred?: string | null;
    list?: string[] | undefined;
  };
}> {
  if (!accessToken) {
    throw new Error("accessToken が空です。USER_SRP_AUTH で取得したアクセストークンを渡してください。");
  }

  // region は明示 or 環境変数から
  const region =
    opts.region ||
    process.env.AWS_REGION;

  if (!region) {
    throw new Error("AWS リージョンが未設定です。opts.region か AWS_REGION を設定してください。");
  }

  const idp = new CognitoIdentityProviderClient({
    region,
    endpoint: opts.endpoint,
  });

  let out: GetUserCommandOutput;
  try {
    out = await idp.send(new GetUserCommand({ AccessToken: accessToken }));
  } catch (e: any) {
    // 代表的な失敗をわかりやすく
    if (e?.name === "NotAuthorizedException") {
      throw new Error("アクセストークンが無効または期限切れです（NotAuthorizedException）。再サインインしてください。");
    }
    if (e?.name === "ResourceNotFoundException") {
      throw new Error("ユーザーが見つかりません（ResourceNotFoundException）。");
    }
    throw e;
  }

  const attributes = Object.fromEntries(
    (out.UserAttributes ?? []).map(a => [a.Name!, a.Value ?? ""])
  );

  // 代表的なクレーム/属性を取り出しやすく
  const result = {
    sub: attributes["sub"],
    username: out.Username,
    attributes,
    mfa: {
      preferred: out.PreferredMfaSetting ?? null,
      list: out.UserMFASettingList,
    },
  };

  return result;
}
