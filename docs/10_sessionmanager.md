# セッション管理
この章は、セッション管理を強化します。このアプリケーションでは、認証はフロントWebアプリケーションが行っています。APIには、AccessTokenを渡すことで、API側で認可を行っています。つまり、自己完結型のセッショントークンを渡しています。

自己完結型トークンについては以下を参考にしてください。

https://github.com/owasp-ja/asvs-ja/blob/master/5.0/ja/0x18-V9-Self-contained-Tokens.md

- アプリケーションが、バックエンドでセッショントークンを検証している
- ログアウトおよび有効期限によってセッショントークンを破棄する

## アプリケーションが、バックエンドでセッショントークンを検証している

バックエンドへは、Authorizationヘッダを通して、AccessTokenを送っています。

`front/src/api/methods.ts:15`

``` typescript
export const setupRequestInterceptor = async (
  config: InternalAxiosRequestConfig,
) => {
  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken?.toString();
  if (!accessToken) {
    throw new Error("Access token is empty");
  }
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};
```

このBearerトークンをバックエンドで検証します。backendでは、`backend/src/middlewares/cognitoAuth.ts:28`の`authenticateToken`が検証を担当しています。

しかし、よく見てください。parseJWTComponentsは、JWTをデコードしているだけで、検証は行ていません。

``` typescript
/**
 * JWTヘッダーとペイロードをパース
 */
const parseJWTComponents = (token: string): any => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    return payload;
  } catch (error) {
    throw new Error('Failed to parse JWT components');
  }
}
/**
 * Base64URL デコード
 */
const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return jsonPayload;
}
```

------

## 課題:トークンの検証を実装
[aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify)をinstallしています。このライブラリは、Amazon Cognitoによって署名された JWT を検証するためのJavaScriptライブラリです。GitHubのドキュメントを参考に検証してみましょう。

https://github.com/awslabs/aws-jwt-verify

<details><summary>回答例</summary>

`backend/src/middlewares/cognitoAuth.ts:57`

``` typescript
    const payload = parseJWTComponents(token);
    ↓
    // aws-jwt-verifyを使用してトークンを検証
    const payload = await cognitoVerifier.verify(token);
```

その他の設定も随時変更してみてください。

</details>

-----

## ログアウトおよび有効期限によってセッショントークンを破棄する
AccessTokenには、有効期限があります。AccessTokenをデコードしてみてみましょう。`exp`が有効期限を表しています。

``` json
{
    "sub": "f754faa8-20d1-7070-2e50-603b8ee46b44",
    "iss": "https:\/\/cognito-idp.ap-northeast-1.amazonaws.com\/ap-northeast-1_4CUbFEjv2",
    "client_id": "5uvlt0urfng454952t6fdhor7g",
    "origin_jti": "9f7a9d3f-1f87-4f55-b2cc-dcf3aee69b8a",
    "event_id": "d0269ae7-0566-43f3-9929-8f6e76612d27",
    "token_use": "access",
    "scope": "aws.cognito.signin.user.admin",
    "auth_time": 1766364388,
    "exp": 1766367988,
    "iat": 1766364388,
    "jti": "2d83dcdc-92e8-46a0-b824-3304652deb8e",
    "username": "f754faa8-20d1-7070-2e50-603b8ee46b44"
}
```

AccessTokenは、ローカルストレージに保管されています。このストレージは、有効期限がなく永年保管されます。有効期限によって、利用できなくなりますが、破棄することにはなりません。このストレージをセッションストレージに変更しましょう。セッションストレージは、そのタブが閉じられると破棄されます。

-----

## 課題:セッションストレージを使う
[Amplify](https://docs.amplify.aws/react/)を使っています。このライブラリは、Amplifyは、フロントエンジニアでもBackendをJavascriptで実装できるようにしたAWSのサービスです。このアプリケーションでは、その一部をライブラリとして利用しています。ドキュメントを参考にセッションストレージに切り替えてみましょう。

https://docs.amplify.aws/react/build-a-backend/auth/concepts/tokens-and-credentials/

<details><summary>回答例</summary>

`front/src/config/amplify.ts`

``` typescript
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage } from 'aws-amplify/utils';

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

```

※セッションストレージは、タブを閉じると消えます。つまり別タブでも、有効ではないので、別タブで開くような場合は、未認証状態になることに注意してください。

</details>

