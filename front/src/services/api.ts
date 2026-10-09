const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:15001';

export interface Post {
  id: number;
  content: string;
  type: string;
  posted_at: string;
  user: {
    id: number;
    username: string;
    email: string | null;
    nickname: string | null;
  };
}

export interface CreatePostRequest {
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiService {
  /**
   * 新しい投稿を作成
   */
  async createPost(data: CreatePostRequest, accessToken: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '投稿の作成に失敗しました');
      }

      return result;
    } catch (error) {
      console.error('投稿作成エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿一覧を取得
   */
  async getPosts(page: number = 1, limit: number = 20): Promise<ApiResponse<PostsResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '投稿一覧の取得に失敗しました');
      }

      return {
        success: result.success,
        data: {
          data: result.data,
          pagination: result.pagination,
        },
      };
    } catch (error) {
      console.error('投稿一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error('サーバーが利用できません');
      }

      return result;
    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
