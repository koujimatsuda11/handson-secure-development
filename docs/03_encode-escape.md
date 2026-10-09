# エンコードとエスケープ
この章では、エンコードとエスケープを実装します。

エンコードとエスケープについては、別の処理系にデータを渡すときに、データをデータとして渡すためのものです。つまり、データと命令を分離して、渡すことが重要です。なので、別の処理系にデータを渡す箇所に注目します。

このトレーニングにおけるバックエンドにおいて、別の処理系にデータを渡す箇所は、DBと画像の保存、フロントへの出力、ログ出力です。

## SQLインジェクション(DB)
では、DBから確認してみましょう。このトレーニングでは、`backend/src/services`に集約されていそうです。

`backend/src/services/UserService.ts:130`を見てみましょう。このトレーニングでは、[TypeORM](https://typeorm.io/)を使っております。

下記のコードのように、`username`のデータをパラメータとして渡しています。このような渡し方の場合、データをデータとして渡しているため、SQLインジェクションが発生しづらくなります。

``` typescript
  async getProfile(username: string): Promise<string> {
    // if not found, throw EntityNotFoundError
    const user = await this.repos.userRepository.findOneOrFail({
      where: { username },
    });

    return user.profile ?? '';
  }
```

> [!NOTE]   
> TypeORMのFind Optionsを利用しています。使い方などは、ドキュメントに目を通しておきましょう。  
> https://typeorm.io/docs/working-with-entity-manager/find-options
>   
> 例えば、以下のように使い方によっては、SQLインジェクションの危険性があることも指摘されています。  
> If you need to provide user input, you should not include the user input directly in your query as this may create a SQL injection vulnerability. Instead, you can use the second argument of the Raw function to provide a list of parameters to bind to the query.

### SQLインジェクションを修正する

1. `backend/src/services/PostService.ts:35`を開いてみます。

``` typescript
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
```

``` typescript
.where(`user.username = '${username}'`)
```

に注目します。文字列結合で、カラム名とデータを結合しています。これは、データと命令の分離ができておりません。

このコードは、SQLインジェクション攻撃に脆弱です。

では、修正してみます

2. プレースホルダ（バインド変数）を使います

``` typescript
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
        .where('user.username = :username', { username: username })
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
```

``` typescript
.where('user.username = :username', { username: username })
```

に注目してください。`:username`でデータが入る場所を指定し、第２引数でデータを指定しています。このことで、データと命令（SQL）が分離することができました。エンコードとエスケープは、私たちは実装しませんが、この実装でTypeORMもしくはDBがエスケープしてくれるようになります。

> [!NOTE]  
> QueryBuilderの使い方については、同じくドキュメントを参考にしてください。  
> https://typeorm.io/docs/query-builder/select-query-builder  

### SQLインジェクションを修正する②
実は、同じ箇所にもう一つSQLインジェクションに脆弱な箇所があります。

``` typescript
.addOrderBy(sortBy, sortDir)
```

ここです。文字列結合していないのになぜでしょうか？`sortBy`が問題になります。`sortBy`にはカラム名が入ります。実はカラム名は、ほとんどの SQL ライブラリ／ORMでパラメータ化できません。つまり、エスケープされずそのまま、値が入ります。同じく、`sortDir`に指定される`DESC`や`ASC`も、エスケープされずそのまま値が入ります。そのため、ユーザ入力の値を指定するとSQLインジェクションの危険性があります。

`order by`や`group by`などに指定するカラム名や`ASC`,`DESC`などのSQLの予約語は、ユーザ入力から受け取った値を使うべきではありません。プログラム由来の文字列を使いましょう。

修正案としては下記ですが、実は本来の仕様上、`sortBy`と`sortDir`は固定でいいので、固定で入れてしまいます。

``` typescript
  async findPosts(
    loggedInUserId: number,
    username: string,
    offset?: number,
    limit?: number
  ): Promise<PostDto[]> {
    let posts: Post[];
    if (username) {
      posts = await this.repos.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.users', 'users')
        .where('user.username = :username', { username: username })
        .orderBy('post.posted_at', 'DESC')
        .skip(offset || DEFAULT_LIST_OFFSET)
        .take(limit || DEFAULT_LIST_LIMIT)
        .getMany();
    } else {
      posts = await this.repos.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.users', 'users')
        .orderBy('post.posted_at', 'DESC')
        .skip(offset || DEFAULT_LIST_OFFSET)
        .take(limit || DEFAULT_LIST_LIMIT)
        .getMany();
    }

    return this.toDtos(posts, loggedInUserId);
  }
```

> [!NOTE]  
> ソートの仕様を固定化することで、汎用性は下がりましたが、安全性は上がりました。開発者心理としてはできる限り汎用化したいのですが、汎用化し過ぎると、リスクが上がる傾向にあります。極論、SQLを指定できれば、どんな仕様変更にも柔軟に対応できますが、SQLインジェクションの危険性は格段にあがります。  
> 汎用性と安全性のバランスをとるようにしましょう。

-----

### 課題:SQLインジェクション攻撃に弱いコードを修正しましょう
上述の箇所以外に、`backend/src/services/PostService.ts`において、SQLインジェクション攻撃に脆弱な箇所を見つけて修正しましょう。

<details><summary>回答例</summary>

`backend/src/services/PostService.ts:77`

``` typescript
  async updatePost(
    postid: any,
    content: string,
    user: User,
  ): Promise<PostDto> {
    const post = await this.repos.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.users', 'users')
      .where('post.id = :id', { id: postid})
      .getOne();

    if (!post) {
      throw new Error(`Post:${postid} not found.`);
    }

    post.content = content;

    await this.repos.postRepository.save(post);
    return this.toDto(post, user.id);
  }

```

`backend/src/services/PostService.ts:98`

``` typescript
  async deletePost(
    postid: any,
    user: User,
  ): Promise<void> {
    const post = await this.repos.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.users', 'users')
      .where('post.id = :id', { id: postid})
      .getOne();

    if (!post) {
      throw new Error(`Post:${postid} not found.`);
    }

    await this.repos.postRepository.remove(post);
  }
```

</details>

-----

## ログインジェクション

DB以外の処理系へデータを渡す箇所を見てみます。まずは、ログについて見てみましょう。ログに出力する際には、ログインジェクションの危険性があります。例えば、ログは概ね１行、１ログになっていることが多いですが、改行コードをそのまま改行として、入れられることで、複数行にわたるログを入れることができます。そのため、特にユーザ入力の内容をログに書き込む場合には、エンコードやエスケープが求められます。

`backend/src/helpers/logger.ts`を見てみます。このトレーニングでは、[pino](https://github.com/pinojs/pino)というloggerライブラリを使っています。loggerライブラリの多くは、自動的にエンコードやエスケープを行ってくれますので、ログの書き込みには、例えば、`console.log()`をそのまま使うのではなく、ライブラリを使うのがいいでしょう。

`backend/src/middlewares/scopeAuth.ts:30`のように、loggerを使います。

``` typescript
import { logger } from '../helpers/logger';

if (accessToken) {
  logger.info('accessTokenが提供されました、UserInfo APIを呼び出します');
  try {
    const user = await fetchUserInfoFromCognitoViaGetUser(accessToken, {
      region: "ap-northeast-1",
    });
    username = user.attributes.email || user.username || payload.sub;
    email = user.attributes.email || null;
  } catch (error) {
    logger.info({ 
      sub: payload.sub,
      error: error,
      msg: 'UserInfo取得エラー、デフォルト値を使用します'
    });
    // UserInfo取得に失敗した場合のフォールバック
    username = typeof payload.email === 'string' ? payload.email : payload.sub;
    email = typeof payload.email === 'string' ? payload.email : null;
  }
} else {
  logger.info('accessTokenが提供されていません、デフォルト値を使用');
  // accessTokenが提供されていない場合のフォールバック
  username = typeof payload.email === 'string' ? payload.email : payload.sub;
  email = typeof payload.email === 'string' ? payload.email : null;
}

```

また、エラーハンドリングを統一化することにより、ログ出力も一緒にやってしまうのもよいと思います。

`backend/src/middlewares/global/errorHandler.ts:24`は、入力値検証エラーが起こった場合は、422のステータスコードをレスポンスしたうえで、入力値検証エラー用のメッセージを残します。

``` typescript
  } else if (err instanceof ValidationError) {
    statusCode = 422;
    message = 'Unprocessable Entity';
    logValidationFail(req, err.message, err);
  } else if (err instanceof AuthenticationError) {
```

-----

### 課題:ログインジェクション攻撃への対策
#### ログインジェクション攻撃に弱いコードを修正しましょう。
`console.log`を直接呼び出している場合、ログインジェクション攻撃に脆弱になる可能性があります。見つけて修正してみましょう。

<details><summary>回答例</summary>

`backend/src/controllers/UserController.ts:26`

``` typescript
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.body.profileが160文字を超える場合、エラーを投げる
      if (req.body.profile && req.body.profile.length > 160) {
        throw new ValidationError(`Validation failed: Profile must be 160 characters or less. profile=${req.body.profile}`);
      }

      const profile = await this.services.userService.updateProfile(
        req.user.username,
        req.body.profile,
      );

      res.status(200).json({ profile });
    } catch (err: unknown) {
      next(err as Error);
    }
  }
```

</details>

-----

## クロスサイトスクリプティング(XSS)
データをHTML（ブラウザという処理系）に渡すときに発生する危険性があるのが、クロスサイトスクリプティング攻撃です。このトレーニングでは、backendからは、JSON形式でレスポンスして、それをfrontのアプリケーションが受け取って、表示しています。そのため、エンコードとエスケープは、frontで実施しています。frontは、[React](https://ja.react.dev/)を利用しています。

Reactでは、通常自動的にエンコードされます。`front/src/modules/Profile/Profile.tsx:280`を見てみます

``` typescript
<Box sx={{ mt: 2 }}>
  <Typography variant="body1" sx={{ mb: 1 }}>
    {profileData?.profile || "プロフィールが設定されていません"}
  </Typography>
```

`{}`を使う場合においては、{}の中身を文字列、つまりデータとして扱われますので、React が DOM に文字列を出すときにエンコードを行います。

`front/src/modules/PostCard/PostCard.tsx:164`を見てみます。`dangerouslySetInnerHTML`を使っています。

``` typescript
{/* 投稿内容 */}
<Typography variant="body1" sx={contentStyles}>
  <span dangerouslySetInnerHTML={{ __html: content }} />
</Typography>
```

名前の通り、危険な関数でエンコードをあえてせずに、出力したい場合に使います。この場合、`content`の内容にJavascriptの内容が入っていた場合、クロスサイトスクリプティング攻撃に脆弱になります。

修正例は下記の通り、`dangerouslySetInnerHTML`を使わないことです。

``` typescript
{/* 投稿内容 */}
<Typography variant="body1" sx={contentStyles}>
  {content}
</Typography>
```
