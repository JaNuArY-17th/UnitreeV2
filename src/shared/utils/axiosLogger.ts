import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Extend InternalAxiosRequestConfig to include meta property
export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    startTime: number;
    requestId?: string;
    [key: string]: any;
  };
}

// Configuration for network logging
const ENABLE_NETWORK_LOGGING = true; // Set to false to disable logging
const MAX_BODY_LENGTH = 1000; // Maximum length for request/response body in logs
const REQUEST_TIMEOUT = 30000; // Time to keep request info in memory (ms)

// Network logging system
interface RequestInfo {
  id: string;
  method: string;
  url: string;
  baseUrl: string;
  fullUrl: string;
  instance: string;
  headers: any;
  data: any;
  startTime: number;
  timeout: NodeJS.Timeout;
}

// Store request information
const requestMap = new Map<string, RequestInfo>();

// Generate UUID for request tracking
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper functions for network logging
export const getTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};

export const truncateBody = (data: any): any => {
  if (!data) return data;

  const stringified = typeof data === 'string' ? data : JSON.stringify(data);
  if (stringified.length <= MAX_BODY_LENGTH) return data;

  return `${stringified.substring(0, MAX_BODY_LENGTH)}... [truncated]`;
};

export const getFullUrl = (config: ExtendedAxiosRequestConfig): string => {
  const { baseURL, url } = config;
  if (!baseURL) return url || '';

  // Remove trailing slash from baseURL if present
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  // Remove leading slash from url if present
  const path = url?.startsWith('/') ? url.slice(1) : url;

  return `${base}/${path}`;
};

export const logRequest = (config: ExtendedAxiosRequestConfig): void => {
  if (!ENABLE_NETWORK_LOGGING) return;

  const { method, url, headers, data, baseURL } = config;
  const instance = 'API';
  const fullUrl = getFullUrl(config);

  // Generate unique ID for this request
  const requestId = generateUUID();

  // Store request info for later correlation with response
  const timeout = setTimeout(() => {
    // Clean up requests that never got a response after timeout
    if (requestMap.has(requestId)) {
      const reqInfo = requestMap.get(requestId);
      console.warn(`⚠️ [${getTime()}] Request timed out without response: ${reqInfo?.method} ${reqInfo?.fullUrl}`);
      requestMap.delete(requestId);
    }
  }, REQUEST_TIMEOUT);

  const requestInfo: RequestInfo = {
    id: requestId,
    method: method?.toUpperCase() || 'UNKNOWN',
    url: url || '',
    baseUrl: baseURL || '',
    fullUrl,
    instance,
    headers,
    data: truncateBody(data),
    startTime: new Date().getTime(),
    timeout
  };

  requestMap.set(requestId, requestInfo);

  // Attach request ID to config for later retrieval
  config.meta = {
    startTime: requestInfo.startTime,
    requestId
  };
};

export const logResponse = (response: AxiosResponse): void => {
  if (!ENABLE_NETWORK_LOGGING) return;

  const { config, status, data: responseData } = response;
  const extendedConfig = config as ExtendedAxiosRequestConfig;
  const requestId = extendedConfig.meta?.requestId;

  if (!requestId || !requestMap.has(requestId)) {
    // Fallback if we can't find the request (shouldn't happen)
    console.log(`✅ [${getTime()}] Response ${status}: ${config.method?.toUpperCase()} ${getFullUrl(extendedConfig)}`);
    console.log('Data:', truncateBody(responseData));
    return;
  }

  // Get the stored request info
  const requestInfo = requestMap.get(requestId)!;
  clearTimeout(requestInfo.timeout);
  requestMap.delete(requestId);

  // Calculate request duration
  const duration = new Date().getTime() - requestInfo.startTime;

  // Log combined request/response info
  console.group(`🔄 [${getTime()}] ${requestInfo.method} ${requestInfo.fullUrl} → ${status} (${duration}ms)`);
  console.log('┌── Request ───────────────────────────────────────────────');
  console.log('│ Headers:', requestInfo.headers);
  if (requestInfo.data) {
    console.log('│ Body:', requestInfo.data);
  }
  console.log('└──────────────────────────────────────────────────────────');
  console.log('┌── Response ──────────────────────────────────────────────');
  console.log(`│ Status: ${status}`);
  console.log('│ Data:', responseData);
  console.log('└──────────────────────────────────────────────────────────');
  console.groupEnd();
};

export const logError = (error: any): void => {
  if (!ENABLE_NETWORK_LOGGING) return;

  const { config, response } = error;
  if (!config) {
    console.error('❌ REQUEST ERROR', error);
    return;
  }

  const extendedConfig = config as ExtendedAxiosRequestConfig;
  const requestId = extendedConfig.meta?.requestId;

  if (!requestId || !requestMap.has(requestId)) {
    // Fallback if we can't find the request
    console.group(`❌ [${getTime()}] ${config.method?.toUpperCase()} ${getFullUrl(extendedConfig)} → ERROR`);
    if (response) {
      console.log(`Status: ${response.status}`);
      console.log('Response:', truncateBody(response.data));
    } else {
      console.log('Error:', error.message);
    }
    console.groupEnd();
    return;
  }

  // Get the stored request info
  const requestInfo = requestMap.get(requestId)!;
  clearTimeout(requestInfo.timeout);
  requestMap.delete(requestId);

  // Calculate request duration
  const duration = new Date().getTime() - requestInfo.startTime;
  const statusCode = response ? response.status : 'ERROR';

  // Log combined request/error info
  console.group(`❌ [${getTime()}] ${requestInfo.method} ${requestInfo.fullUrl} → ${statusCode} (${duration}ms)`);
  console.log(`Instance: ${requestInfo.instance}`);
  console.log('┌── Request ───────────────────────────────────────────────');
  console.log('│ Headers:', requestInfo.headers);
  if (requestInfo.data) {
    console.log('│ Body:', requestInfo.data);
  }
  console.log('└──────────────────────────────────────────────────────────');
  console.log('┌── Error ─────────────────────────────────────────────────');
  if (response) {
    console.log(`│ Status: ${response.status}`);
    console.log('│ Response:', truncateBody(response.data));
  } else {
    console.log('│ Message:', error.message);
  }
  console.log('└──────────────────────────────────────────────────────────');
  console.groupEnd();
};

// Apply network logging interceptors
export const applyNetworkLoggingInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config) => {
      logRequest(config as ExtendedAxiosRequestConfig);
      return config;
    },
    (error) => {
      logError(error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error) => {
      logError(error);
      return Promise.reject(error);
    }
  );
};
