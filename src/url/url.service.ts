import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlService {
  private readonly urlMap = new Map<string, string>();

  // Generate a random string for URL shortening
  generateCode(): string {
    return Math.random().toString(36).substring(2, 12);
  }

  // Store the mapping
  saveUrl(code: string, originalUrl: string): void {
    this.urlMap.set(code, originalUrl);
  }

  // Retrieve the original URL
  getUrl(code: string): string | undefined {
    return this.urlMap.get(code);
  }
}
