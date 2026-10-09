import React, { useState } from 'react';
import { apiService } from '../services/api';

interface PostFormProps {
  accessToken: string;
  onPostCreated: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ accessToken, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('投稿内容を入力してください');
      return;
    }

    if (content.length > 1000) {
      setError('投稿内容は1000文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.createPost(
        { content: content.trim() },
        accessToken
      );

      setContent('');
      onPostCreated();
      
      // 成功メッセージを表示（短時間で消える）
      const successElement = document.createElement('div');
      successElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
      `;
      successElement.textContent = '投稿が作成されました！';
      document.body.appendChild(successElement);
      
      setTimeout(() => {
        successElement.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(successElement);
        }, 300);
      }, 2000);

    } catch (error) {
      console.error('投稿作成エラー:', error);
      setError(error instanceof Error ? error.message : '投稿の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 1000 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e1e5e9',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
      }}>
        新しい投稿
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今何を考えていますか？"
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: `2px solid ${isOverLimit ? '#dc3545' : '#e1e5e9'}`,
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              if (!isOverLimit) {
                e.target.style.borderColor = '#007bff';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isOverLimit ? '#dc3545' : '#e1e5e9';
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: error ? '12px' : '0',
        }}>
          <span style={{
            fontSize: '14px',
            color: isOverLimit ? '#dc3545' : remainingChars < 50 ? '#ffc107' : '#666',
            fontWeight: isOverLimit || remainingChars < 50 ? '600' : 'normal',
          }}>
            残り{remainingChars}文字
          </span>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || isOverLimit}
            style={{
              backgroundColor: isSubmitting || !content.trim() || isOverLimit ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting || !content.trim() || isOverLimit ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              minWidth: '80px',
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && content.trim() && !isOverLimit) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting && content.trim() && !isOverLimit) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            fontSize: '14px',
            marginTop: '8px',
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};