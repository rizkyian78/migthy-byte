import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { ConfigModule } from '@nestjs/config';
import Config from './config/config';

@Module({
  imports: [
    UrlModule,
    ConfigModule.forRoot({
      load: [Config],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
