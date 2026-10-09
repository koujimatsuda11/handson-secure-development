import React, { useState, useEffect } from 'react';
import { apiService, type Post } from '../services/api';

interface PostListProps {
  refreshTrigger?: number;
}

export const PostList: React.FC<PostListProps> = ({ refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await apiService.getPosts(pageNum, 10);
      
      if (response.success && response.data) {
        if (append) {
          setPosts(prev => [...prev, ...response.data!.data]);
        } else {
          setPosts(response.data.data);
        }
        setHasMore(response.data.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('投稿一覧取得エラー:', error);
      setError(error instanceof Error ? error.message : '投稿一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, [refreshTrigger]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}></div>
        <p style={{ color: '#666', margin: '0' }}>投稿を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24',
          marginBottom: '16px',
        }}>
          {error}
        </div>
        <button
          onClick={() => fetchPosts(1, false)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          再試行
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <p style={{ 
          color: '#666', 
          margin: '0',
          fontSize: '16px'
        }}>
          まだ投稿がありません。<br />
          最初の投稿をしてみましょう！
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
      }}>
        投稿一覧
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              gap: '8px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {post.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                }}>
                  {post.user.username}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                }}>
                  {formatDate(post.posted_at)}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#333',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {post.content}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            style={{
              backgroundColor: isLoadingMore ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoadingMore ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              minWidth: '120px',
            }}
            onMouseOver={(e) => {
              if (!isLoadingMore) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoadingMore) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {isLoadingMore ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};