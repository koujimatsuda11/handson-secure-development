## ログドキュメント

### アプリケーションログの形式

アプリケーションログはJSON形式で出力され、以下の形式を採用しています。

```json
{
  "level": "warning",
  "appid": "dev_t1BackendPHP",
  "event": "authn_login_fail",
  "description": "Authorization header not found.",
  "source_ip": "127.0.0.1",
  "hostname": "680a95cf2ece",
  "request_uri": "api/posts",
  "request_method": "POST"
}
```

### ログの詳細

- `level` と `event` の組み合わせは、アプリケーションで何が起きたかを表しています。

| level    | event                 | 説明                                 |
|----------|-----------------------|--------------------------------------|
| warning  | input_validation_fail | 入力値の検証に失敗した場合           |
| error    | authz_fail            | 認可エラーが発生した場合             |
| warning  | sys_crash             | システムのクラッシュが発生した場合   |
| info     | not_found_resource    | 要求されたリソースが存在しない場合   |
| warning  | authn_login_fail      | 認証エラーが発生した場合             |
| warning  | authn_token_invalid   | 認証トークンに不備がある場合        |

### その他のフィールドの説明

- `appid`: アプリケーションのIDや名称を示します。
- `description`: イベントの詳細やエラーメッセージを示します。
- `source_ip`: リクエストを送信したクライアントのIPアドレスを示します。
- `hostname`: ホストマシンの名前またはIDを示します。
- `request_uri`: リクエストのURIを示します。
- `request_method`: 使用されたHTTPメソッド (GET, POSTなど) を示します。


