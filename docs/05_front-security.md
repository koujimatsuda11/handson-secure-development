# Web フロントエンドセキュリティ
この章では、フロントエンドにデータを残さないような設定、クロスサイトスクリプティング(XSS)攻撃に対する保護などのWeb フロントエンドセキュリティについて学びます。

Web フロントエンドセキュリティについて、詳しくは[OWASP ASVS V3](https://github.com/owasp-ja/asvs-ja/blob/master/5.0/ja/0x12-V3-Web-Frontend-Security.md)を参照してください

## レスポンスヘッダ
Web フロントエンドセキュリティでは、ブラウザのセキュリティ機能を最大限に活用するため、以下のレスポンスヘッダを活用します。

- Cache-Control: no-store
- Content-Type
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options or Content-Security-Policy ヘッダフィールドの frame-ancestors
- Content-Security-Policy

### Cache-Control
`Cache-Control`ヘッダは、キャッシュをブラウザーや共有キャッシュ（プロキシーや CDN など）において制御するためのディレクティブです。

特に注意が必要なのは、`no-cache`は、キャッシュしないことを表す値ではなく、`no-store`がキャッシュしないことを表す値です。キャッシュをしてほしくない場合は、`no-store`を設定します。

```
Cache-Control: no-store
```

### Content-Type
`Content-Type`ヘッダは、クライアントに返されたコンテンツの実際の種類を伝えます。これには、`charaset`も付与します。例えば、`text/html; charset=utf-8`です。

charsetがないと、例えば、サーバは UTF-8 で生成した HTML を返すが Content-Type: text/html のみの場合に、ブラウザが ISO-8859-1 と判断して一部バイトを別文字として解釈します。< や > を含むバイトがスクリプト開始と見なされ XSS が発生する可能性があります。

```
Cache-Type: text/html; charset=utf-8
Content-Type: application/json; charset=UTF-8
```

### HTTP Strict Transport Security
HTTP Strict Transport Securityは、ブラウザにHTTPSを強制するレスポンスヘッダです。HTTP を使用してサイトを読み込まないことと、HTTP を使用してサイトにアクセスしようとするすべての試みを HTTPS リクエストへ自動的に変換する必要があることを指示することができます。 

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### X-Content-Type-Options
X-Content-Type-Options は HTTP のレスポンスヘッダーで、 Content-Type ヘッダーで示された MIME タイプを変更せずに従うべきであることを示します。過去のブラウザの中には、Content-Type ヘッダーの指示を無視して、返されたコンテンツの内容に応じたContent-Typeに解釈するブラウザがあります。この動きを利用した攻撃方法があるため、X-Content-Type-Optionsでこの動きを抑制します。

```
X-Content-Type-Options: nosniff
```

### X-Frame-Options or Content-Security-Policy ヘッダフィールドの frame-ancestors
X-Frame-Options は、私たちのWebページを他人のページの `<frame>`、`<iframe>`、`<embed>`、`<object>` の中に表示することを許可するかどうかを示すために使用することができます。クリックジャッキング攻撃の対策として、用いられることがあります。

```
X-Frame-Options: DENY # 他人のページで表示することを許可しない
or
X-Frame-Options: SAMEORIGIN # 同じオリジンのみ許可する
```

### Content-Security-Policy(CSP)
Content-Security-Policy(CSP)は、Webページが「どこから読み込んだリソースを使ってよいか」をブラウザに指示するためのセキュリティ用HTTPヘッダです。ここでいう「リソース」には、JavaScript、CSS、画像、iframe などが含まれます。

CSPの目的は、信頼できないリソースの読み込みや実行を制限することです。これにより、攻撃者が外部から悪意のあるコードを読み込ませたり、HTMLに不正なコードを混入させたりすることを防ぎます。クロスサイトスクリプティング(XSS)攻撃に防ぎます。

特にインラインJavascriptの実行を抑制します。インラインJavascriptとは、HTMLファイル内にあるJavascriptコードを指します。クロスサイトスクリプティング(XSS)攻撃の多くは、画面表示するためのHTMLに悪意のあるJavascriptコードを挿入することで、攻撃を行います。インラインJavascriptの実行を抑制することで、この悪意のあるJavascriptコードの実行を防ぐことを目的とします。

もちろん、クロスサイトスクリプティング(XSS)攻撃は、別の方法でも発生する可能性がありますので、完全に防御できるわけではないですが、かなり強力の抑制効果があります。

反面デメリットもあり、すでにWebアプリケーションがインラインJavascriptに依存している場合、導入できないか、改修が必要になります。また、Content-Security-Policy(CSP)はルールが複雑で学習コストも高いことがあげられます。

デメリットもありますが、メリットも非常に大きいので、ぜひ活用しましょう。

```
contentSecurityPolicy:
    default-src 'self'; // 他の*-srcの代替として使われる
    connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com; // 読み込むことができるコンテンツのドメインを指定する
    script-src 'self'; // JavaScript の情報なソースを指定する
    object-src 'none'; //  <object> や <embed> 要素の有効なソースを指定します
    base-uri 'none'; // <base> 要素のURLを指定します  
    style-src 'self' 'unsafe-inline'; // スタイルシートの有効なソースを指定します。 unsafe-inlineは文字通り、安全ではありません。本当は消したい
    img-src 'self' data:; // img-src ディレクティブは、画像やファビコンの有効なソースを指定します。data:は、不要なら消したい
```
