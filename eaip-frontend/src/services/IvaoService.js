// Frontend service for polling IVAO network status
class IvaoService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3001/api';
        this.pollingInterval = null;
        this.pollFrequency = 60000; // 60 seconds
        this.listeners = [];
        this.currentStatus = null;
    }

    /**
     * Start polling for GMMM_CTR status
     */
    startPolling() {
        if (this.pollingInterval) {
            console.warn('IVAO polling already started');
            return;
        }

        console.log('Starting IVAO polling...');

        // Initial fetch
        this.fetchStatus();

        // Set up interval
        this.pollingInterval = setInterval(() => {
            this.fetchStatus();
        }, this.pollFrequency);
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('IVAO polling stopped');
        }
    }

    /**
     * Fetch GMMM_CTR status from backend
     */
    async fetchStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/ivao/gmmm-ctr`);
            const result = await response.json();

            if (result.success) {
                const newStatus = result.data;
                const statusChanged = this.hasStatusChanged(newStatus);

                this.currentStatus = newStatus;

                // Notify listeners
                if (statusChanged) {
                    console.log('GMMM_CTR status changed:', newStatus);
                    this.notifyListeners(newStatus);
                }
            } else {
                console.error('Failed to fetch IVAO status:', result.error);
            }
        } catch (error) {
            console.error('Error fetching IVAO status:', error);
        }
    }

    /**
     * Check if status has changed
     */
    hasStatusChanged(newStatus) {
        if (!this.currentStatus) return true;
        return this.currentStatus.online !== newStatus.online;
    }

    /**
     * Subscribe to status changes
     * @param {Function} callback - Function to call when status changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);

        // Immediately call with current status if available
        if (this.currentStatus) {
            callback(this.currentStatus);
        }

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    /**
     * Notify all listeners of status change
     */
    notifyListeners(status) {
        this.listeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error('Error in IVAO listener:', error);
            }
        });
    }

    /**
     * Get current status (synchronous)
     */
    getCurrentStatus() {
        return this.currentStatus;
    }

    /**
     * Set polling frequency
     * @param {number} milliseconds - Polling frequency in milliseconds
     */
    setPollingFrequency(milliseconds) {
        this.pollFrequency = milliseconds;

        // Restart polling if active
        if (this.pollingInterval) {
            this.stopPolling();
            this.startPolling();
        }
    }
}

// Create singleton instance
const ivaoService = new IvaoService();

export default ivaoService;
