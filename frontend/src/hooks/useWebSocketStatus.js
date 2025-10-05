import { useState, useEffect } from 'react';
import websocketService from '../services/websocket.js';

/**
 * Custom React hook for monitoring WebSocket connection status
 * and providing user feedback with retry capabilities
 */
export const useWebSocketStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(20);
  const [canRetry, setCanRetry] = useState(false);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    // Status change handler
    const handleStatusChange = (status, errorData = {}) => {
      setConnectionStatus(status);
      
      if (status === 'error') {
        setCanRetry(errorData.canRetry || false);
        setLastError(errorData);
      } else {
        setLastError(null);
      }
      
      // Update reconnect attempts
      const stats = websocketService.getConnectionStats();
      setReconnectAttempts(stats.reconnectAttempts);
      setMaxReconnectAttempts(stats.maxReconnectAttempts);
    };

    // Register the status change handler
    websocketService.onStatusChange(handleStatusChange);

    // Get initial status
    const stats = websocketService.getConnectionStats();
    setConnectionStatus(stats.status);
    setReconnectAttempts(stats.reconnectAttempts);
    setMaxReconnectAttempts(stats.maxReconnectAttempts);

    // Cleanup on unmount
    return () => {
      websocketService.offStatusChange(handleStatusChange);
    };
  }, []);

  // Manual retry function
  const retryConnection = async () => {
    try {
      await websocketService.retryConnection();
      setLastError(null);
      setCanRetry(false);
    } catch (error) {
      console.error('Manual retry failed:', error);
      setLastError({ ...error, manualRetryFailed: true });
    }
  };

  // Get connection statistics
  const getConnectionStats = () => {
    return websocketService.getConnectionStats();
  };

  // Get user-friendly status message
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return `Connecting... (${reconnectAttempts}/${maxReconnectAttempts})`;
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        if (lastError?.maxAttemptsReached) {
          return `Connection failed after ${maxReconnectAttempts} attempts`;
        }
        return 'Connection error';
      default:
        return 'Unknown status';
    }
  };

  // Get status color for UI indicators
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'green';
      case 'connecting':
        return 'orange';
      case 'disconnected':
        return 'gray';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return {
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    canRetry,
    lastError,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
    retryConnection,
    getConnectionStats,
    getStatusMessage,
    getStatusColor
  };
};

export default useWebSocketStatus;
