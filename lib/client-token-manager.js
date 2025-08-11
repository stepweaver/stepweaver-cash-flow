'use client';

import { useAuth } from './authContext.js';

// Client-side token manager for secure API calls
class ClientTokenManager {
  constructor() {
    this.tokenCache = new Map();
    this.tokenExpiry = new Map();
  }

  // Get a scoped token for a specific operation
  async getScopedToken(scope, resourceId = null, additionalClaims = {}) {
    try {
      // Check if we have a valid cached token
      const cacheKey = `${scope}:${resourceId || 'global'}`;
      const cachedToken = this.tokenCache.get(cacheKey);
      const expiryTime = this.tokenExpiry.get(cacheKey);

      if (cachedToken && expiryTime && Date.now() < expiryTime) {
        return cachedToken;
      }

      // Get the current user's Firebase ID token
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const firebaseIdToken = await auth.currentUser.getIdToken();

      // Request a new scoped token from the server
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseIdToken,
          scope,
          resourceId,
          additionalClaims
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get scoped token');
      }

      const tokenData = await response.json();

      // Cache the token with expiry
      this.tokenCache.set(cacheKey, tokenData.token);
      this.tokenExpiry.set(cacheKey, Date.now() + (tokenData.expiresIn * 1000));

      return tokenData.token;
    } catch (error) {
      console.error('Error getting scoped token:', error);
      throw error;
    }
  }

  // Make an authenticated API call using a scoped token
  async makeAuthenticatedRequest(endpoint, options = {}, requiredScope = null) {
    try {
      // Get the appropriate scope based on the HTTP method
      let scope = requiredScope;
      if (!scope) {
        if (options.method === 'GET') {
          scope = this.getReadScopeForEndpoint(endpoint);
        } else {
          scope = this.getWriteScopeForEndpoint(endpoint);
        }
      }

      // Get a scoped token
      const token = await this.getScopedToken(scope);

      // Make the request with the token
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making authenticated request:', error);
      throw error;
    }
  }

  // Helper methods to determine appropriate scopes for endpoints
  getReadScopeForEndpoint(endpoint) {
    if (endpoint.includes('business-transactions')) {
      return 'read_business_transactions';
    } else if (endpoint.includes('personal-data')) {
      return 'read_personal_data';
    } else if (endpoint.includes('users')) {
      return 'read_users';
    }
    throw new Error('Unknown endpoint for scope determination');
  }

  getWriteScopeForEndpoint(endpoint) {
    if (endpoint.includes('business-transactions')) {
      return 'write_business_transactions';
    } else if (endpoint.includes('personal-data')) {
      return 'write_personal_data';
    } else if (endpoint.includes('users')) {
      return 'write_users';
    }
    throw new Error('Unknown endpoint for scope determination');
  }

  // Clear expired tokens from cache
  clearExpiredTokens() {
    const now = Date.now();
    for (const [key, expiryTime] of this.tokenExpiry.entries()) {
      if (now >= expiryTime) {
        this.tokenCache.delete(key);
        this.tokenExpiry.delete(key);
      }
    }
  }

  // Clear all cached tokens (useful on logout)
  clearAllTokens() {
    this.tokenCache.clear();
    this.tokenExpiry.clear();
  }
}

// Create a singleton instance
const tokenManager = new ClientTokenManager();

// Clean up expired tokens every minute
setInterval(() => {
  tokenManager.clearExpiredTokens();
}, 60000);

export default tokenManager;

// Convenience functions for common operations
export async function getBusinessTransactions() {
  return tokenManager.makeAuthenticatedRequest('/api/business-transactions');
}

export async function createBusinessTransaction(transactionData) {
  return tokenManager.makeAuthenticatedRequest('/api/business-transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData)
  });
}

export async function getPersonalData(year, month) {
  return tokenManager.makeAuthenticatedRequest(`/api/personal-data?year=${year}&month=${month}`);
}

export async function createPersonalIncome(incomeData) {
  return tokenManager.makeAuthenticatedRequest('/api/personal-data', {
    method: 'POST',
    body: JSON.stringify({
      type: 'income',
      data: incomeData
    })
  });
}

export async function createPersonalBill(billData) {
  return tokenManager.makeAuthenticatedRequest('/api/personal-data', {
    method: 'POST',
    body: JSON.stringify({
      type: 'bill',
      data: billData
    })
  });
}
