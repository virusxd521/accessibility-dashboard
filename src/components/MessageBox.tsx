import React from 'react';

interface MessageBoxProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  show: boolean;
}

const customColors = {
  primary: '#2c3e50',
  secondary: '#3498db',
  danger: '#e74c3c',
  warning: '#f39c12',
  success: '#2ecc71',
  light: '#ecf0f1',
  dark: '#34495e',
  info: '#3498db',
  gray: '#95a5a6',
};

const MessageBox: React.FC<MessageBoxProps> = ({ message, type = 'success', show }) => {
  if (!show) return null;

  let bgColor = customColors.success;
  switch (type) {
    case 'success': bgColor = customColors.success; break;
    case 'error': bgColor = customColors.danger; break;
    case 'info': bgColor = customColors.secondary; break;
    case 'warning': bgColor = customColors.warning; break;
    default: bgColor = customColors.success;
  }

  return (
    <div
      className={`message-box ${show ? 'active' : ''}`}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 30px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 50,
        backgroundColor: bgColor,
        color: 'white',
        transition: 'opacity 0.5s ease-in-out',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none'
      }}
    >
      {message}
    </div>
  );
};

export default MessageBox;
