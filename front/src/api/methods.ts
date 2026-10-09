// axiosのインスタンスをインポートし、設定を定義
import axios, { InternalAxiosRequestConfig } from "axios";
import { fetchAuthSession } from 'aws-amplify/auth';

// 環境変数からAPIのベースURLを取得してaxiosインスタンスを作成
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * リクエストにAuthorizationヘッダーを追加する関数
 * @param config - Axiosリクエストの設定
 * @returns - 更新されたリクエスト設定
 */
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

// トークンをリクエストヘッダーに追加し、レスポンスのエラーを処理するインターセプター
instance.interceptors.request.use(setupRequestInterceptor);

/**
 * 共通のHTTPリクエスト処理関数
 * @param method - HTTPメソッド
 * @param path - APIのエンドポイント
 * @param data - リクエストデータ（オプション）
 * @returns - レスポンスデータまたはエラー情報
 */
const makeRequest = async (
  method: "get" | "post" | "put" | "delete",
  path: string,
  data?: unknown,
) => {
  try {
    const response = data
      ? await instance[method](path, data)
      : await instance[method](path);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // エラーをスローしてTanStack Queryに処理させる
  }
};

/**
 * GETリクエストを送る関数
 * @param path - APIのエンドポイント
 * @returns - レスポンスデータまたはエラー情報
 */
export const get = (path: string) => makeRequest("get", path);

/**
 * POSTリクエストを送る関数
 * @param path - APIのエンドポイント
 * @param data - Axiosリクエストのデータ
 * @returns - レスポンスデータまたはエラー情報
 */
export const post = (path: string, data: unknown) =>
  makeRequest("post", path, data);

/**
 * PUTリクエストを送る関数
 * @param path - APIのエンドポイント
 * @param data - Axiosリクエストのdata
 * @returns - レスポンスデータまたはエラー情報
 */
export const put = (path: string, data: unknown) =>
  makeRequest("put", path, data);

/**
 * DELETEリクエストを送る関数
 * @param path - APIのエンドポイント
 * @returns - レスポンスデータまたはエラー情報
 */
export const deleteRequest = (path: string) => makeRequest("delete", path);
