// Simple keep-alive service to prevent Render cold starts
class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.pingInterval = 10 * 60 * 1000; // 10 minutes
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        // Only ping if user is active (not in background)
        if (!document.hidden) {
          const response = await fetch('/api/auth/ping', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          console.log('Keep-alive ping:', response.status === 200 ? 'OK' : 'Failed');
        }
      } catch (error) {
        console.log('Keep-alive ping failed (expected if server sleeping):', error.message);
      }
    }, this.pingInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

export const keepAliveService = new KeepAliveService();
