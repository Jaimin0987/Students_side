# WebSocket Connection Fix - Documentation

## Problem Fixed
The original error "Max reconnection attempts reached" occurred because the WebSocket service was limited to only 5 reconnection attempts with no way to manually retry. This fix provides a comprehensive solution for robust WebSocket connections.

## Key Improvements

### 1. Enhanced Reconnection Strategy
- **Increased attempts**: From 5 to 20 maximum reconnection attempts
- **Exponential backoff**: Delays increase exponentially (1s, 2s, 4s, 8s, etc.) up to 30s maximum
- **Jitter**: Random delay added to prevent thundering herd problem
- **Manual retry**: Users can retry connection after max attempts reached

### 2. Connection Health Monitoring
- **Heartbeat monitoring**: Automatically detects stale connections
- **Connection timeout**: Forces reconnection if no activity for 60 seconds
- **Status tracking**: Real-time connection status updates

### 3. Message Queuing
- **Offline messages**: Messages are queued when disconnected and sent when reconnected
- **Auto-recovery**: Users automatically rejoin communities on reconnection
- **Queue management**: Limited to 100 messages to prevent memory issues

### 4. User Experience Improvements
- **Status indicators**: Visual feedback for connection status
- **Retry button**: Manual retry option when auto-reconnection fails
- **Debug information**: Detailed connection statistics for troubleshooting

## Usage Examples

### Basic Usage
```javascript
import websocketService from './services/websocket.js';

// Connect to WebSocket
await websocketService.connect('ws://localhost:8000');

// Set user
websocketService.setUser('user123');

// Join a community
websocketService.joinCommunity('community456');

// Send message with automatic queueing if disconnected
websocketService.sendWithQueue('NEW_MESSAGE', { text: 'Hello!' });
```

### Using React Hook
```jsx
import { useWebSocketStatus } from './hooks/useWebSocketStatus.js';

function MyComponent() {
  const { 
    isConnected, 
    hasError, 
    canRetry, 
    retryConnection,
    getStatusMessage 
  } = useWebSocketStatus();

  return (
    <div>
      <p>Status: {getStatusMessage()}</p>
      {canRetry && (
        <button onClick={retryConnection}>
          Retry Connection
        </button>
      )}
    </div>
  );
}
```

### Using Status Components
```jsx
import WebSocketStatus, { 
  WebSocketStatusIndicator, 
  WebSocketDebugInfo 
} from './components/WebSocketStatus.jsx';

function App() {
  return (
    <div>
      {/* Full status with retry button */}
      <WebSocketStatus showDetails={true} />
      
      {/* Compact indicator for navbar */}
      <WebSocketStatusIndicator />
      
      {/* Debug info (development only) */}
      <WebSocketDebugInfo />
    </div>
  );
}
```

## Configuration Options

### Connection Settings
```javascript
// In websocket.js constructor, you can modify:
this.maxReconnectAttempts = 20;     // Maximum retry attempts
this.reconnectInterval = 1000;       // Initial delay (1 second)
this.maxReconnectInterval = 30000;   // Maximum delay (30 seconds)
```

### Advanced Usage
```javascript
// Get detailed connection statistics
const stats = websocketService.getConnectionStats();
console.log(stats);

// Listen for status changes
websocketService.onStatusChange((status, errorData) => {
  console.log('Connection status changed:', status);
  if (status === 'error' && errorData.maxAttemptsReached) {
    // Show user notification about connection failure
  }
});

// Manual connection management
websocketService.disconnect();        // Manual disconnect
await websocketService.retryConnection(); // Manual retry
```

## Error Handling

The service now handles various error scenarios:

1. **Network disconnection**: Automatic reconnection with exponential backoff
2. **Server unavailable**: Continues retrying until max attempts
3. **Connection timeout**: Detects stale connections and reconnects
4. **Max attempts reached**: Provides manual retry option
5. **Manual disconnection**: Prevents automatic reconnection

## Status Indicators

- 🟢 **Connected**: WebSocket is active and healthy
- 🟠 **Connecting**: Attempting to connect or reconnect
- 🔴 **Error**: Connection failed after max attempts
- ⚪ **Disconnected**: Not connected (manual or initial state)

## Troubleshooting

### Common Issues

1. **Still getting "Max reconnection attempts reached"**
   - Check if backend server is running
   - Verify WebSocket URL is correct
   - Use the manual retry button or `retryConnection()` method

2. **Connection appears stuck**
   - Check browser console for detailed error messages
   - Use `WebSocketDebugInfo` component to see connection stats
   - Verify firewall/proxy settings

3. **Messages not being sent**
   - Check if connection is established using `isConnected()`
   - Use `sendWithQueue()` instead of `send()` for automatic queuing
   - Verify message format matches server expectations

### Debug Information
```javascript
// Get comprehensive debug info
const stats = websocketService.getConnectionStats();
console.log('WebSocket Stats:', stats);

// Manual health check
console.log('Is Connected:', websocketService.isConnected());
console.log('Status:', websocketService.getConnectionStatus());
```

## Testing the Fix

1. Start your backend server
2. Load the frontend application
3. Check that the connection indicator shows green (connected)
4. Stop the backend server
5. Observe automatic reconnection attempts
6. Restart the server and verify automatic reconnection
7. Test manual retry when max attempts are reached

## Files Modified/Created

- `frontend/src/services/websocket.js` - Enhanced WebSocket service
- `frontend/src/hooks/useWebSocketStatus.js` - React hook for status monitoring
- `frontend/src/components/WebSocketStatus.jsx` - UI components for status display

The fix is now complete and should resolve the "Max reconnection attempts reached" error while providing a much better user experience for WebSocket connections.
