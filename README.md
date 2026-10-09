# セキュア開発トレーニングハンズオン basic

このプロジェクトは、セキュア開発トレーニングのハンズオン環境を提供します。説明に従ってハンズオンを進めてください。

## 開始方法

ハンズオンは、GitHubのCodespacesを利用します。以下の手順からCodespacesを作成してください。

[開始方法](./docs/get-starting.md)


## カリキュラム

このプロジェクトは、ハンズオン環境のみを提供します。講義セクションの内容は、講師の説明に従ってください。

1. [入力値検証](./docs/02_input-validation.md)
2. [エンコードとエスケープ](./docs/03_encode-escape.md)
3. [サードパーティ製コンポーネントの脆弱性](./docs/04_3rd_party_component.md)
4. [Web フロントエンドセキュリティ](./docs/05_front-security.md)
5. [認証のセキュリティ要件](./docs/09_authentication.md)
6. [セッション管理](./docs/10_sessionmanager.md)
7. [認可](./docs/11_authorization.md)
8. [ロギング](./docs/12_logging.md)

## プロジェクト概要
このテンプレートは、Node.js Express.js + React.jsによるフルスタックWebアプリケーション構築用のテンプレートです。プロジェクトは以下で構成されています：

- **フロントエンド**: React.js（TypeScript）+ Vite
- **バックエンド**: Node.js Express.js（TypeScript）+ TypeORM + MySQL
- **ローカル開発**: Docker Composeによる完全コンテナ化開発環境

## ローカル環境準備

以下をローカル環境にインストールします

1. docker engine
1. docker compose
1. [nodejs](https://nodejs.org/ja)
1. git


## アーキテクチャ
### 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite + ESLint
- **バックエンド**: Node.js + Express.js + TypeScript + TypeORM
- **データベース**: MySQL 8.0 (ローカル: Docker)
- **認証**: Magnito
- **ローカル開発**: Docker Compose (フルコンテナ化)

### ディレクトリ構造

```
.
├── front/                  # Reactフロントエンド
│   ├── src/
│   │   ├── components/     # React コンポーネント
│   │   ├── hooks/          # カスタムフック（認証等）
│   │   ├── services/       # API通信、認証サービス
│   │   └── config/         # 設定ファイル
│   └── dist/               # ビルド成果物
├── backend/                # Express.jsバックエンド
│   ├── src/
│   │   ├── apis/           # APIエンドポイント
│   │   ├── entities/       # TypeORM エンティティ
│   │   ├── database/       # DB設定・マイグレーション
│   │   ├── middlewares/    # Express ミドルウェア
│   │   └── helpers/        # ユーティリティ
│   └── dist/               # ビルド成果物
├── db/                     # ローカル開発用DB設定
└── compose.yaml            # Docker Compose設定
```

### API設計

- **エンドポイント**: `/api/*` （CloudFront経由でECSに転送）
- **認証**: JWT Bearer Token (AWS Cognito)
- **データベース**: TypeORMによるORM操作
- **エラーハンドリング**: 統一エラーレスポンス

## メンテナー
* 松田康司 / OWASP Kansai

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

