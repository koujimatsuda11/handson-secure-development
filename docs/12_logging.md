# ロギング
この章は、ロギングを強化します。このアプリケーションは、ECSで動いています。アプリケーションログは、Cloud Watchに保管するようになっています。

## アプリケーションログ
ログ出力には、ロガーライブラリなどを使うとよいと思います。このアプリケーションでは、Javascriptで使える`pino`を使っていますが、組織で使っているものがあれば、そちらに合わせてください。`console.log`などは、ログインジェクションに対する対策がされていなかったりするので、ライブラリを使ってください。

このプロジェクトでは、グローバルのエラーハンドラーを実装しています。

`backend/src/middlewares/global/errorHandler.ts:8`

``` typescript
export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction):void => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode: number;
  let message: string;

  if (err instanceof EntityNotFoundError) {
    statusCode = 404;
    message = 'Not Found';
    logNotFoundResource(req, err.message);
  } else if (err instanceof AuthorizationError) {
    statusCode = 403;
    message = 'Forbidden';
    logAuthorizationFail(req, err.message, err);
  } else if (err instanceof ValidationError) {
    statusCode = 422;
    message = 'Unprocessable Entity';
    logValidationFail(req, err.message, err);
  } else if (err instanceof AuthenticationError) {
    statusCode = 401;
    message = 'Unauthorized';
    logAuthFail(req, err.message, err);
  } else {
    statusCode = 500;
    message = 'Internal Server Error';
    logSysCrash(req, err.message, err);
  }

  res.status(statusCode).json({ message });
};
```

例外エラー発生時には、Exceptionをthrowするとログが出力されます。また、ログのフォーマットを統一して、どのイベントが発生したか、アクセスした人の情報を自動で入るようにしています。

以下は、11章の先ほど認可エラーの動作が成功（つまり認可拒否）したときのログです。

``` json
app  | {"level":"error","time":"2025-12-22T01:03:43.098Z","event":"authz_fail","description":"User:koujimatsuda11@gmail.com cannot update Post:3.","useragent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36","source_ip":"::ffff:172.18.0.2","host_ip":"::ffff:172.18.0.4","hostname":"app","protocol":"http","port":3000,"request_uri":"/api/posts/3","request_method":"PUT","err":{"type":"AuthorizationError","message":"User:koujimatsuda11@gmail.com cannot update Post:3.","stack":"AuthorizationError: User:koujimatsuda11@gmail.com cannot update Post:3.\n    at PostService.<anonymous> (/app/src/services/PostService.ts:83:13)\n    at Generator.next (<anonymous>)\n    at fulfilled (/app/src/services/PostService.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)","name":"AuthorizationError"},"msg":"User:koujimatsuda11@gmail.com cannot update Post:3."}
```

### 課題:ログに機密情報
ログに機密情報が保管されています。見つけてそのログ出力を削除してください。

<details><summary>回答例</summary>
アクセストークンは、セッショントークンとして扱われます。有効期限があるため一時的な情報ですが、漏えいすると不正アクセスに使われる非常に重要な情報です。ログに残すのは控えましょう。

`backend/src/middlewares/cognitoAuth.ts:56`

``` typescript
    logger.info(`アクセストークンの検証開始: ${token}`);
```

</details>

## 課題:入力値検証の失敗のログ
入力値検証で失敗したときのログを残してください。まずは、下記の箇所で、`console.log`を使っています。これを排除し、正しくログを残してください。

`backend/src/controllers/UserController.ts:26`

``` typescript
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.body.profileが160文字を超える場合、エラーを投げる
      if (req.body.profile && req.body.profile.length > 160) {
        console.log(`validation error: profile=${req.body.profile}`);
        throw new Error('Profile must be 160 characters or less');
      }
```

また、その他ハンズオンで追加した入力値検証でログが残っていない箇所がないかチェックし、ログを残しましょう

<details><summary>回答例</summary>

`backend/src/controllers/UserController.ts:26`

``` typescript
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedData = updateProfileZodSchema.safeParse({ profile: req.body.profile });

      if (!parsedData.success) {
        const errorMessages = parsedData.error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new ValidationError(`Validation failed: ${errorMessages}`);
      }
```

</details>

共通してアプリケーションログに残すべき内容は、以下となっています。ログが残っているか、いない場合は追加してみてください。

- 入力値検証の失敗
- 出力の失敗（DBのエラー、コマンドのエラーなど）
- 認証の成功、失敗
- 認可の失敗
- セッション管理の失敗
- アプリケーションエラー（構文エラー、ランタイムエラー、接続エラー）
- アプリケーションの起動と停止
- リスクの高い機能の使用（※）
- 規約の同意などのオプトイン

※スクの高い機能

- ユーザーの追加または削除
- 権限の変更
- ユーザーへのAPIトークンの割り当て
- APIトークンの追加または削除
- システム管理権限の使用
- アプリケーション管理者によるアクセス
- アプリケーション管理権限を持つユーザーによるすべての操作
- 支払い情報へのアクセス
- データ暗号化キーの使用やキーの変更
- 画面ベースのレポートを含むデータのインポートとエクスポート
- ユーザーが作成したコンテンツの送信（特にファイルのアップロード））

## インフラログ
インフラのログは残っているでしょうか？AWSなどのクラウドサービスでは、ログは残す設定をしないと残りません。

以下のように、インフラ環境のログがあるといいと思います。もちろん残すのにもお金はかかりますが、本番環境であれば残しておきましょう。

- Cognitoの認証ログ
- Cloud Frontのアクセスログ
- S3のアクセスログ
- Application Load Balancerのアクセスログ
- ECSアプリケーションログ
- Aurora エラーログ/スローログ
- VPCフローログ

### Cognitoの認証ログ
Cognitoのアクティビティログは、Plusプランにしたうえで、脅威保護をONにすると記録を閲覧することができます。監査モードでONにすることで、とりあえず保護はせず、ログだけ記録できます。さらに、CloudWatch Logsにエクスポートしておくことで、分析などもしやすくなります。

### Cloud Frontのアクセスログ

CloudFrontも標準のログ記録が用意されています。S3に保管することが可能です。

### S3のアクセスログ

S3のアクセスログも取得してみます。CloudFrontと同じバケットに保存するようにしてみます。

### Application Load Balancerのアクセスログ

ALBのアクセスログも残すことができます。CloudFrontとS3と同じバケットに入れておきましょう。（正直中、見たことあんまりないです。）prefixだけ分けておきます。

### ECSアプリケーションログ
ECSのログは、CloudWatch Logsに残っています。バラバラですね。ログレベルは、WARNとしてログを残しています。アプリケーションの標準出力の内容をログに残すようになります。

### Aurora エラーログ/スローログ
Auroraのログは、CloudWatchLogsに転送するかどうかを選択します。以下では、3つのログをCloudWatch Logsに転送しており、1か月保管しています。1年ぐらいでもいいんですが。

### VPCフローログ
VPCフローログは、VPCに流れるパケットを記録します。ますます人間が見ることはないですが、GuardDutyをONにする場合は、セットで取得することがあります。何かあった場合に調べるときに、解析するログの一つになると思います。
