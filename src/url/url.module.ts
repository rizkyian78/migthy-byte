import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlGateway } from './url.gateway';

@Module({
  controllers: [UrlController],
  providers: [UrlService, UrlGateway]
})
export class UrlModule {}
