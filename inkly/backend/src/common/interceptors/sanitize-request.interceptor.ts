import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Utility class to sanitize sensitive fields from objects.
 * This can be used by logging middleware to prevent passwords from being logged.
 * 
 * Note: This interceptor does NOT modify the request body to avoid breaking
 * authentication. It's a no-op interceptor that provides the sanitization
 * utility for use in logging middleware.
 */
@Injectable()
export class SanitizeRequestInterceptor implements NestInterceptor {
  static readonly sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

  /**
   * Sanitize sensitive fields from an object (creates a copy, doesn't modify original).
   * Use this in logging middleware to prevent sensitive data from being logged.
   */
  static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => SanitizeRequestInterceptor.sanitizeObject(item));
    }

    const sanitized = { ...obj };
    for (const field of SanitizeRequestInterceptor.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (
        sanitized[key] &&
        typeof sanitized[key] === 'object' &&
        !Array.isArray(sanitized[key])
      ) {
        sanitized[key] = SanitizeRequestInterceptor.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // This interceptor is a no-op but provides the sanitization utility
    // for use in logging middleware. It doesn't modify the request to avoid
    // breaking authentication flows.
    return next.handle();
  }
}
