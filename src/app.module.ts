import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

type DBType = 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mongodb' | 'mssql';

@Module({
  imports: [
    AuthModule,
    UserModule,
    WalletModule,
    TransactionModule,
    ConfigModule.forRoot({
      // envFilePath: 'src/config/.env', // seems to not work
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<DBType>('DB_TYPE')!,
        host: configService.get<string>('PG_HOST')!,
        port: parseInt(configService.get<string>('PG_PORT') || '5432'),
        username: configService.get<string>('PG_USER')!,
        password: configService.get<string>('PG_PASSWORD')!,
        database: configService.get<string>('PG_DB')!,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
