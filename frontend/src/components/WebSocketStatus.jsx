import React from 'react';
import { useWebSocketStatus } from '../hooks/useWebSocketStatus.js';

/**
 * WebSocket Connection Status Component
 * Displays connection status and provides retry functionality
 */
const WebSocketStatus = ({ showDetails = false, className = '' }) => {
  const {
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    canRetry,
    isConnected,
    isConnecting,
    hasError,
    retryConnection,
    getStatusMessage,
    getStatusColor,
    getConnectionStats
  } = useWebSocketStatus();

  const statusColor = getStatusColor();
  const statusMessage = getStatusMessage();

  // Status indicator styles
  const indicatorStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: statusColor,
    marginRight: '8px',
    display: 'inline-block'
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: hasError ? '#fee2e2' : isConnected ? '#dcfce7' : '#f3f4f6',
    border: `1px solid ${hasError ? '#fecaca' : isConnected ? '#bbf7d0' : '#d1d5db'}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const buttonStyle = {
    marginLeft: '12px',
    padding: '4px 8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  };

  const handleRetry = async () => {
    try {
      await retryConnection();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <div className={`websocket-status ${className}`} style={containerStyle}>
      <span style={indicatorStyle}></span>
      <span>{statusMessage}</span>
      
      {canRetry && (
        <button 
          onClick={handleRetry}
          style={buttonStyle}
          disabled={isConnecting}
        >
          {isConnecting ? 'Retrying...' : 'Retry'}
        </button>
      )}
      
      {showDetails && (
        <div style={{ marginLeft: '12px', fontSize: '12px', color: '#666' }}>
          {hasError && `(${reconnectAttempts}/${maxReconnectAttempts})`}
        </div>
      )}
    </div>
  );
};

/**
 * Compact status indicator for navigation bars
 */
export const WebSocketStatusIndicator = ({ className = '' }) => {
  const { isConnected, isConnecting, hasError, getStatusColor } = useWebSocketStatus();
  
  const indicatorStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(),
    display: 'inline-block',
    animation: isConnecting ? 'pulse 2s infinite' : 'none'
  };

  const title = isConnected ? 'WebSocket Connected' : 
               isConnecting ? 'WebSocket Connecting...' :
               hasError ? 'WebSocket Error' : 'WebSocket Disconnected';

  return (
    <div className={`websocket-indicator ${className}`} title={title}>
      <span style={indicatorStyle}></span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

/**
 * Debug component showing detailed connection statistics
 */
export const WebSocketDebugInfo = ({ className = '' }) => {
  const { getConnectionStats } = useWebSocketStatus();
  const stats = getConnectionStats();

  const debugStyle = {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '8px',
    marginTop: '8px'
  };

  return (
    <div className={`websocket-debug ${className}`} style={debugStyle}>
      <div><strong>WebSocket Debug Info:</strong></div>
      <div>Status: {stats.status}</div>
      <div>Connected: {stats.isConnected ? 'Yes' : 'No'}</div>
      <div>Attempts: {stats.reconnectAttempts}/{stats.maxReconnectAttempts}</div>
      <div>Queued Messages: {stats.queuedMessages}</div>
      <div>Communities: {stats.currentCommunities}</div>
      <div>User ID: {stats.userId || 'None'}</div>
      <div>Last Heartbeat: {stats.lastHeartbeat ? new Date(stats.lastHeartbeat).toLocaleTimeString() : 'Never'}</div>
      <div>Manual Disconnect: {stats.manuallyDisconnected ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default WebSocketStatus;
