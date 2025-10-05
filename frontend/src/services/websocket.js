class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20; // Increased from 5 to 20
    this.reconnectInterval = 1000; // Start with 1 second
    this.maxReconnectInterval = 30000; // Maximum 30 seconds between attempts
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnecting = false;
    this.userId = null;
    this.currentCommunities = [];
    this.connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'error'
    this.statusHandlers = [];
    this.messageQueue = []; // Queue messages when disconnected
    this.manuallyDisconnected = false; // Track if user manually disconnected
    this.heartbeatInterval = null;
    this.lastHeartbeat = null;
  }

  connect(wsUrl = 'ws://localhost:8000') {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return this.connectionPromise;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.manuallyDisconnected = false; // Reset manual disconnection flag
    this.isConnecting = true;
    this.connectionStatus = 'connecting';
    this.notifyStatusChange('connecting');
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0; // Reset attempts on successful connection
          this.connectionStatus = 'connected';
          this.notifyStatusChange('connected');
          
          // Start heartbeat monitoring
          this.startHeartbeat();
          
          // Process queued messages
          this.processMessageQueue();
          
          // Rejoin user to previous communities if reconnecting
          if (this.userId) {
            this.send('JOIN_CHAT', { userId: this.userId });
            this.currentCommunities.forEach(communityId => {
              this.send('NEW_USER', { groupId: communityId, userId: this.userId });
            });
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.updateLastHeartbeat();
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.isConnecting = false;
          this.connectionStatus = 'disconnected';
          this.notifyStatusChange('disconnected');
          this.stopHeartbeat();
          
          // Only attempt reconnection if not manually disconnected
          if (!this.manuallyDisconnected) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.connectionStatus = 'error';
          this.notifyStatusChange('error');
          this.stopHeartbeat();
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        this.connectionStatus = 'error';
        this.notifyStatusChange('error');
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  attemptReconnect() {
    // Don't reconnect if we're already trying to connect or if we manually disconnected
    if (this.isConnecting || this.manuallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Exponential backoff with jitter to avoid thundering herd
      const baseDelay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectInterval);
      const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
      const delay = baseDelay + jitter;
      
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.round(delay)}ms`);
      this.connectionStatus = 'connecting';
      this.notifyStatusChange('connecting');
      
      setTimeout(() => {
        // Check again if we should still attempt reconnection
        if (!this.manuallyDisconnected && !this.isConnected()) {
          this.connect().catch(error => {
            console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
            // Don't immediately set to error status, let attemptReconnect decide
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              this.connectionStatus = 'error';
              this.notifyStatusChange('error');
            }
          });
        }
      }, delay);
    } else {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Please check your connection and try manually reconnecting.`);
      this.connectionStatus = 'error';
      this.notifyStatusChange('error', {
        maxAttemptsReached: true,
        canRetry: true
      });
    }
  }

  disconnect() {
    console.log('Manually disconnecting WebSocket');
    this.manuallyDisconnected = true; // Mark as manually disconnected
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    if (this.userId) {
      // Leave chat and remove user from all communities
      this.send('LEAVE_CHAT', { userId: this.userId });
      this.currentCommunities.forEach(communityId => {
        this.send('REMOVE_USER', { groupId: communityId, userId: this.userId });
      });
    }

    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect'); // Use normal closure code
      this.ws = null;
    }
    this.connectionPromise = null;
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
    this.notifyStatusChange('disconnected');
    this.userId = null;
    this.currentCommunities = [];
    this.messageQueue = []; // Clear message queue
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      return true;
    } else {
      console.warn('WebSocket is not connected. Message not sent:', { type, payload });
      return false;
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    // Call registered handlers for this message type
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`Error in message handler for ${type}:`, error);
      }
    });

    // Log received messages for debugging
    console.log('WebSocket message received:', { type, payload });
  }

  // Register a handler for a specific message type
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);
  }

  // Remove a handler for a specific message type
  off(messageType, handler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // User management methods
  setUser(userId) {
    this.userId = userId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('JOIN_CHAT', { userId });
    }
  }

  joinCommunity(communityId) {
    if (this.userId && !this.currentCommunities.includes(communityId)) {
      this.currentCommunities.push(communityId);
      this.send('NEW_USER', { groupId: communityId, userId: this.userId });
    }
  }

  leaveCommunity(communityId) {
    if (this.userId && this.currentCommunities.includes(communityId)) {
      this.currentCommunities = this.currentCommunities.filter(id => id !== communityId);
      this.send('REMOVE_USER', { groupId: communityId, userId: this.userId });
    }
  }

  // Join general feed (for posts not in specific communities)
  joinGeneralFeed() {
    if (this.userId) {
      this.send('NEW_USER', { groupId: 'NATHI_KOI_GROUP', userId: this.userId });
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Connection status management
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
  }

  offStatusChange(handler) {
    const index = this.statusHandlers.indexOf(handler);
    if (index > -1) {
      this.statusHandlers.splice(index, 1);
    }
  }

  notifyStatusChange(status) {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in status change handler:', error);
      }
    });
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Manual retry method for when max attempts are reached
  retryConnection() {
    console.log('Manual retry requested');
    this.reconnectAttempts = 0; // Reset attempts
    this.manuallyDisconnected = false; // Allow reconnection
    return this.connect();
  }

  // Heartbeat methods
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing interval
    this.updateLastHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        // Check if we've received a heartbeat recently
        const now = Date.now();
        const timeSinceLastHeartbeat = now - this.lastHeartbeat;
        
        // If no heartbeat for 60 seconds, consider connection stale
        if (timeSinceLastHeartbeat > 60000) {
          console.warn('Connection appears stale, forcing reconnection');
          this.ws.close(1006, 'Connection timeout');
        }
      }
    }, 30000); // Check every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updateLastHeartbeat() {
    this.lastHeartbeat = Date.now();
  }

  // Message queue methods
  queueMessage(type, payload) {
    console.log('Queueing message for later delivery:', { type, payload });
    this.messageQueue.push({ type, payload, timestamp: Date.now() });
    
    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift(); // Remove oldest message
    }
  }

  processMessageQueue() {
    console.log(`Processing ${this.messageQueue.length} queued messages`);
    const messages = [...this.messageQueue];
    this.messageQueue = []; // Clear queue
    
    messages.forEach(({ type, payload }) => {
      this.send(type, payload);
    });
  }

  // Enhanced send method with queueing
  sendWithQueue(type, payload) {
    if (this.isConnected()) {
      return this.send(type, payload);
    } else {
      this.queueMessage(type, payload);
      return false;
    }
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isConnected: this.isConnected(),
      manuallyDisconnected: this.manuallyDisconnected,
      queuedMessages: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
      currentCommunities: this.currentCommunities.length,
      userId: this.userId
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
