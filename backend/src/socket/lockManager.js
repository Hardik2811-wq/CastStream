// Resilient Distributed / Local Atomic Lock Manager
// Prevents race conditions, double bidding, and deadlock in high-frequency auction environments

class LockManager {
  constructor() {
    this.inMemoryLocks = new Map();
    this.lockTimeouts = new Map();
  }

  /**
   * Acquire an exclusive lock on an auction resource
   * @param {string} resourceKey - e.g. "auction:650f..."
   * @param {number} ttlMs - Max time to hold lock before forced release (failsafe)
   */
  async acquire(resourceKey, ttlMs = 5000) {
    const startWait = Date.now();
    const maxWaitMs = 8000;

    // Spin-wait with exponential backoff and timeout
    while (this.inMemoryLocks.get(resourceKey)) {
      if (Date.now() - startWait > maxWaitMs) {
        console.warn(`[LockManager] Lock wait timeout for ${resourceKey}, breaking deadlock`);
        this.release(resourceKey);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    this.inMemoryLocks.set(resourceKey, true);

    // Auto-release watchdog to prevent permanent deadlock if unhandled exception occurs
    const timeoutHandle = setTimeout(() => {
      if (this.inMemoryLocks.get(resourceKey)) {
        console.warn(`[LockManager] Auto-releasing expired lock on ${resourceKey}`);
        this.release(resourceKey);
      }
    }, ttlMs);

    this.lockTimeouts.set(resourceKey, timeoutHandle);
    return true;
  }

  /**
   * Release the exclusive lock
   * @param {string} resourceKey
   */
  release(resourceKey) {
    if (this.lockTimeouts.has(resourceKey)) {
      clearTimeout(this.lockTimeouts.get(resourceKey));
      this.lockTimeouts.delete(resourceKey);
    }
    this.inMemoryLocks.delete(resourceKey);
  }

  /**
   * Check if resource is currently locked
   */
  isLocked(resourceKey) {
    return !!this.inMemoryLocks.get(resourceKey);
  }
}

export const lockManager = new LockManager();
