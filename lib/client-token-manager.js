'use client';

import { useAuth } from './authContext.js';
import { useCallback, useMemo, useRef } from 'react';

// Create a hook-based token manager that integrates with the auth context
export const useTokenManager = () => {
  const { user } = useAuth();

  console.log('useTokenManager hook called, user:', user?.uid);

  // Use useRef to create truly stable references
  const tokenCacheRef = useRef(new Map());
  const tokenExpiryRef = useRef(new Map());

  // Get a scoped token for a specific operation
  const getScopedToken = useCallback(async (scope, resourceId = null, additionalClaims = {}) => {
    try {
      // Check if we have a valid cached token
      const cacheKey = `${scope}:${resourceId || 'global'}`;
      const cachedToken = tokenCacheRef.current.get(cacheKey);
      const expiryTime = tokenExpiryRef.current.get(cacheKey);

      if (cachedToken && expiryTime && Date.now() < expiryTime) {
        console.log('Using cached token for scope:', scope);
        return cachedToken;
      }

      // Check if user is authenticated from context
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Requesting new scoped token for scope:', scope);
      const firebaseIdToken = await user.getIdToken();

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
        console.error('Token request failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to get scoped token');
      }

      const tokenData = await response.json();
      console.log('Received new scoped token for scope:', scope);

      // Cache the token with expiry
      tokenCacheRef.current.set(cacheKey, tokenData.token);
      tokenExpiryRef.current.set(cacheKey, Date.now() + (tokenData.expiresIn * 1000));

      return tokenData.token;
    } catch (error) {
      console.error('Error getting scoped token:', error);
      throw error;
    }
  }, [user?.uid]);

  // Helper methods to determine appropriate scopes for endpoints
  const getReadScopeForEndpoint = useCallback((endpoint) => {
    if (endpoint.includes('business-transactions')) {
      return 'read_business_transactions';
    } else if (endpoint.includes('personal-data')) {
      return 'read_personal_data';
    } else if (endpoint.includes('users')) {
      return 'read_users';
    }
    throw new Error('Unknown endpoint for scope determination');
  }, []);

  const getWriteScopeForEndpoint = useCallback((endpoint) => {
    if (endpoint.includes('business-transactions')) {
      return 'write_business_transactions';
    } else if (endpoint.includes('personal-data')) {
      return 'write_personal_data';
    } else if (endpoint.includes('users')) {
      return 'write_users';
    }
    throw new Error('Unknown endpoint for scope determination');
  }, []);

  // Make an authenticated API call using a scoped token
  const makeAuthenticatedRequest = useCallback(async (endpoint, options = {}, requiredScope = null) => {
    try {
      // Determine the actual HTTP method, defaulting to 'GET' if not explicitly set
      const actualMethod = options.method ? options.method.toUpperCase() : 'GET';

      // Get the appropriate scope based on the HTTP method
      let scope = requiredScope;
      if (!scope) {
        if (actualMethod === 'GET') {
          scope = getReadScopeForEndpoint(endpoint);
        } else {
          scope = getWriteScopeForEndpoint(endpoint);
        }
      }

      console.log('Making authenticated request to:', endpoint, 'with scope:', scope, 'method:', actualMethod);

      // Get a scoped token
      const token = await getScopedToken(scope);

      // Make the request with the token
      const response = await fetch(endpoint, {
        ...options,
        method: actualMethod,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API request failed:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making authenticated request:', error);
      throw error;
    }
  }, [getScopedToken, getReadScopeForEndpoint, getWriteScopeForEndpoint]);

  // Convenience functions for common operations
  const getBusinessTransactions = useCallback(async () => {
    return makeAuthenticatedRequest('/api/business-transactions', { method: 'GET' });
  }, [makeAuthenticatedRequest]);

  const createBusinessTransaction = useCallback(async (transactionData) => {
    return makeAuthenticatedRequest('/api/business-transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }, [makeAuthenticatedRequest]);

  const updateBusinessTransaction = useCallback(async (transactionId, transactionData) => {
    return makeAuthenticatedRequest(`/api/business-transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  }, [makeAuthenticatedRequest]);

  const deleteBusinessTransaction = useCallback(async (transactionId) => {
    return makeAuthenticatedRequest(`/api/business-transactions/${transactionId}`, {
      method: 'DELETE'
    });
  }, [makeAuthenticatedRequest]);

  const getPersonalData = useCallback(async () => {
    return makeAuthenticatedRequest('/api/personal-data', { method: 'GET' });
  }, [makeAuthenticatedRequest]);

  const createPersonalIncome = useCallback(async (incomeData) => {
    return makeAuthenticatedRequest('/api/personal-data', {
      method: 'POST',
      body: JSON.stringify({ ...incomeData, type: 'income' })
    });
  }, [makeAuthenticatedRequest]);

  const createPersonalBill = useCallback(async (billData) => {
    return makeAuthenticatedRequest('/api/personal-data', {
      method: 'POST',
      body: JSON.stringify({ ...billData, type: 'bill' })
    });
  }, [makeAuthenticatedRequest]);

  const updatePersonalBill = useCallback(async (billId, billData) => {
    return makeAuthenticatedRequest(`/api/personal-data/${billId}`, {
      method: 'PUT',
      body: JSON.stringify(billData)
    });
  }, [makeAuthenticatedRequest]);

  const deletePersonalIncome = useCallback(async (incomeId) => {
    return makeAuthenticatedRequest(`/api/personal-data/${incomeId}`, {
      method: 'DELETE'
    });
  }, [makeAuthenticatedRequest]);

  const deletePersonalBill = useCallback(async (billId) => {
    return makeAuthenticatedRequest(`/api/personal-data/${billId}`, {
      method: 'DELETE'
    });
  }, [makeAuthenticatedRequest]);

  const returnObject = useMemo(() => {
    console.log('useTokenManager return object recreated');
    return {
      // Core token management
      getScopedToken,
      makeAuthenticatedRequest,
      getReadScopeForEndpoint,
      getWriteScopeForEndpoint,

      // Business transaction operations
      getBusinessTransactions,
      createBusinessTransaction,
      updateBusinessTransaction,
      deleteBusinessTransaction,

      // Personal data operations
      getPersonalData,
      createPersonalIncome,
      createPersonalBill,
      updatePersonalBill,
      deletePersonalIncome,
      deletePersonalBill
    };
  }, [
    getScopedToken,
    makeAuthenticatedRequest,
    getReadScopeForEndpoint,
    getWriteScopeForEndpoint,
    getBusinessTransactions,
    createBusinessTransaction,
    updateBusinessTransaction,
    deleteBusinessTransaction,
    getPersonalData,
    createPersonalIncome,
    createPersonalBill,
    updatePersonalBill,
    deletePersonalIncome,
    deletePersonalBill
  ]);

  return returnObject;
};
