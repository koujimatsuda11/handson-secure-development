import React from 'react';
import type { User } from '../types/user';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  return (
    <div 
      className="user-profile"
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600' 
        }}>
          ユーザープロファイル
        </h2>
        <p style={{ 
          margin: '0', 
          color: '#666',
          fontSize: '14px' 
        }}>
          ログイン中のユーザー情報
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '4px'
          }}>
            ユーザーID (sub)
          </label>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {user.sub}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '4px'
          }}>
            メールアドレス
          </label>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {user.email}
            {user.email_verified && (
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '3px',
                fontWeight: '500'
              }}>
                認証済み
              </span>
            )}
          </div>
        </div>

        {user.name && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555',
              marginBottom: '4px'
            }}>
              名前
            </label>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {user.name}
            </div>
          </div>
        )}

        {user.preferred_username && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555',
              marginBottom: '4px'
            }}>
              ユーザー名
            </label>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {user.preferred_username}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          width: '100%',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#c82333';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#dc3545';
        }}
      >
        ログアウト
      </button>
    </div>
  );
};