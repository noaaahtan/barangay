import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';

function isTruthy(value?: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').toLowerCase());
}

function getSslOption() {
  const dbSsl = process.env.DB_SSL;
  const useSsl =
    dbSsl !== undefined
      ? isTruthy(dbSsl)
      : process.env.NODE_ENV === 'production' || Boolean(process.env.DATABASE_URL);

  if (!useSsl) {
    return false;
  }

  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED
    ? isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED)
    : false;

  return { rejectUnauthorized };
}

function getBaseConnectionOptions() {
  const ssl = getSslOption();
  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      ssl,
    };
  }


  return {
    host: process.env.DB_HOST,
    port: dbPort,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,
  };
}

export function getTypeOrmConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    ...getBaseConnectionOptions(),
    autoLoadEntities: true,
    synchronize: true, // Dev only — use migrations in production
  };
}

export function getSeedDataSourceConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    ...getBaseConnectionOptions(),
    entities: [User],
    synchronize: true,
  };
}
