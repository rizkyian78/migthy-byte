import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UrlGateway } from './url.gateway';
import { UrlService } from './url.service';

@Controller()
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly urlGateway: UrlGateway,
  ) {}
  @Post('url')
  async shortenUrl(@Body('url') url: string): Promise<{ message: string }> {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    const code = this.urlService.generateCode();
    const shortenedURL = `http://localhost:${3000}/${code}`;

    // Save the URL and notify via WebSocket
    this.urlService.saveUrl(code, url);
    this.urlGateway.broadcastUrl(shortenedURL, url);

    return { message: 'URL shortening in progress' };
  }

  @Get(':code')
  async getUrl(@Param('code') code: string): Promise<{ url: string }> {
    const originalUrl = this.urlService.getUrl(code);
    if (!originalUrl) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    return { url: originalUrl };
  }
}
