import type { DbConnectionConfig } from '../config/types';
import type { DbAdapter } from './db-adapter.interface';
import { PostgresAdapter } from './postgres.adapter';
import { MysqlAdapter } from './mysql.adapter';

export function createDbAdapter(config: DbConnectionConfig): DbAdapter {
  switch (config.type) {
    case 'postgres':
      return new PostgresAdapter(config);
    case 'mysql':
      return new MysqlAdapter(config);
  }
}