import SqlDatabase, { QueryResult } from '@tauri-apps/plugin-sql';

import {
  DatabaseType,
  DestroyOptions,
  FindAllOptions,
  FindOptionsWhere,
  ModelAttributes,
  ModelAttributesProperties,
  ModelDefineOptions,
  ModelOptions,
  RestoreOptions,
  TimestampsProperties,
  TimestampsTypeAndProperties
} from './type';
import { getLocalTime } from './utils';

/** database auto increment */
const autoIncrement = {
  sqlite: 'AUTOINCREMENT',
  mysql: 'AUTO_INCREMENT',
  postgres: 'SERIAL'
};

export default class Model {
  static db: SqlDatabase;
  static rawAttributes: Record<string, any>;
  static rawOptions: ModelOptions;
  static modelName: string;
  static _modelPrimaryKey?: string | null = null;
  static databaseType: DatabaseType;

  static get getDB(): SqlDatabase {
    return this.db;
  }

  static get _getRawAttributes() {
    return this.rawAttributes;
  }

  static get _getRawOptions(): ModelOptions {
    return this.rawOptions;
  }

  static get _getTimezoneDate(): string {
    return getLocalTime(this._getRawOptions.timezone);
  }

  static _init(modelName: string, attributes: ModelAttributes, options: ModelDefineOptions) {
    this._modelPrimaryKey = findPrimaryKey(attributes);
    this.db = options.db as SqlDatabase;
    this.modelName = modelName;
    this._setRawOptions(options);
    this._setTimestampsAttributes(attributes);

    return this;
  }

  static async _setRawOptions(options: ModelDefineOptions) {
    const rawOptions = { ...options };
    if (rawOptions.timestamps) {
      if (rawOptions.createdAt === false) {
        rawOptions.createdAt = false;
      } else {
        rawOptions.createdAt =
          rawOptions.createdAt === undefined ? 'createdAt' : rawOptions.createdAt;
      }
      if (rawOptions.updatedAt === false) {
        rawOptions.updatedAt = false;
      } else {
        rawOptions.updatedAt =
          rawOptions.updatedAt === undefined ? 'updatedAt' : rawOptions.updatedAt;
      }
      if (rawOptions.deletedAt === false) {
        rawOptions.deletedAt = false;
      } else {
        rawOptions.deletedAt =
          rawOptions.deletedAt === undefined ? 'deletedAt' : rawOptions.deletedAt;
      }
    } else {
      rawOptions.createdAt = false;
      rawOptions.updatedAt = false;
      rawOptions.deletedAt = false;
    }
    this.rawOptions = rawOptions;
    this.databaseType = rawOptions.databaseType as DatabaseType;
  }

  static async _setTimestampsAttributes(attributes: ModelAttributes) {
    const rawAttributes = { ...attributes };
    const timestampsAttr = accessTimestamps(this._getRawOptions);
    if (Object.keys.length) {
      for (const key of Object.keys(timestampsAttr)) {
        rawAttributes[timestampsAttr[key].key] = timestampsAttr[key].properties;
      }
    }

    this.rawAttributes = rawAttributes as Record<
      keyof typeof attributes,
      ModelAttributesProperties
    >;
  }

  /**
   * sync table
   *
   * @param options
   * @returns
   *
   * @example
   * ```ts
   * test.sync();
   * ```
   *
   * `force: true` will drop table if exists
   * @example
   * ```ts
   * test.sync({ force: true });
   * ```
   */
  static async sync(options?: { force?: boolean }) {
    if (!this._getRawAttributes) throw new Error('Model not initialized, attributes is undefined.');
    if (options && options.force) {
      await this.drop();
    }

    const keys = Object.keys(this._getRawAttributes);

    const sqlValue = keys.map((item) => {
      let addSql = `${item} ${this._getRawAttributes[item].type}`;
      if (this._getRawAttributes[item].allowNull === false) {
        addSql += ' NOT NULL';
      }
      if (this._getRawAttributes[item].primaryKey) {
        addSql += ' PRIMARY KEY';
      }
      if (this._getRawAttributes[item].autoIncrement) {
        addSql += ` ${autoIncrement[this.databaseType]}`;
      }
      if (this._getRawAttributes[item].unique) {
        addSql += ' UNIQUE';
      }

      if (this._getRawAttributes[item].comment) {
        if (this.databaseType === 'mysql') {
          addSql += ` COMMENT '${this._getRawAttributes[item].comment}'`;
          // TODO: sqlite, postgres
          // } else if (this.databaseType === 'sqlite') {
          //   addSql += ` -- ${this._getRawAttributes[item].comment}`;
          // } else if (this.databaseType === 'postgres') {
          //   addSql += ` -- ${this._getRawAttributes[item].comment}`;
        }
      }

      return addSql;
    });

    const sql = `CREATE TABLE IF NOT EXISTS ${this.modelName} (\r\n      ${sqlValue.join(
      ', \r\n      '
    )}\r\n)`;
    const result = await this.getDB.execute(sql).catch((error) => {
      throw new Error(error);
    });

    return {
      result,
      modelName: this.modelName
    };
  }
  /**
   * create data to table
   * @param data
   * @returns
   *
   * @example
   * ```ts
   * test.create({ name: 'test' });
   * ```
   */
  static async create(data: Record<string, any>) {
    if (!data) throw new Error('Data is undefined.');
    const result = this.bulkCreate([data]).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /**
   * bulk create data to table
   * @param data
   * @returns
   *
   * @example
   * ```ts
   * test.bulkCreate([{ name: 'test' }, { name: 'test2' }]);
   * ```
   */
  static async bulkCreate(data: Record<string, any>[]) {
    if (!data) throw new Error('Data is undefined.');
    const keys = Object.keys(this._getRawAttributes);
    const filteredKeys = keys.filter((item) => !this._getRawAttributes[item].autoIncrement);
    const values = data
      .map((record) => {
        const createValue = [];
        for (const key of Object.keys(this._getRawAttributes)) {
          // add check for autoIncrement
          if (record[key] === undefined) {
            // if autoIncrement, skip
            if (this._getRawAttributes[key].autoIncrement) continue;
            // if defaultValue not undefined, set default value
            // deletedAt will set to null
            if (this._getRawAttributes[key].defaultValue !== undefined) {
              createValue.push(this._getRawAttributes[key].defaultValue);
              record[key] = this._getRawAttributes[key].defaultValue;
            } else if (this._getRawAttributes[key].allowNull === false) {
              // if allowNull is false, throw error
              throw new Error(`Column ${key} is not allow null.`);
            } else {
              createValue.push(null);
              record[key] = null;
            }
          } else {
            createValue.push(record[key]);
          }
        }

        return createValue;
      })
      .flat();

    const placeholders = Array(filteredKeys.length).fill('?').join(', ');
    const placeholdersArr = Array(data.length).fill(`(${placeholders})`).join(', ');

    // INSERT INTO mytable (column1, column2)
    // SELECT value1, value2
    // UNION ALL SELECT value3, value4
    // UNION ALL SELECT value5, value6
    // ...
    const sql = `INSERT INTO ${this.modelName} (${filteredKeys.join(
      ', '
    )}) VALUES ${placeholdersArr}`;
    const result = await this.getDB.execute(sql, values).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /**
   * Bulk upsert records into the table.
   *
   * This method builds an INSERT statement using the columns defined in the model's
   * rawAttributes (excluding autoIncrement columns) and appends an ON CONFLICT clause.
   * The conflict target is the primary key(s) and on conflict, non-primary key columns are updated.
   *
   * @param data Array of record objects to upsert.
   * @returns The QueryResult from executing the upsert.
   */
  static async bulkUpsert(data: Record<string, any>[]): Promise<QueryResult> {
    if (!data) throw new Error('Data is undefined.');

    // Get all columns from the raw attributes.
    const keys = Object.keys(this._getRawAttributes);
    // Exclude autoIncrement columns (they are usually generated by the DB).
    const filteredKeys = keys.filter((key) => !this._getRawAttributes[key].autoIncrement);

    // Build the values array using the filtered column order.
    const values = data
      .map((record) => {
        const createValue: any[] = [];
        for (const key of filteredKeys) {
          if (record[key] === undefined) {
            // If a defaultValue is defined, use it.
            if (this._getRawAttributes[key].defaultValue !== undefined) {
              createValue.push(this._getRawAttributes[key].defaultValue);
              record[key] = this._getRawAttributes[key].defaultValue;
            } else if (this._getRawAttributes[key].allowNull === false) {
              throw new Error(`Column ${key} is not allowed to be null.`);
            } else {
              createValue.push(null);
              record[key] = null;
            }
          } else {
            createValue.push(record[key]);
          }
        }
        return createValue;
      })
      .flat();

    // Create a placeholder string for one row, e.g., "(?, ?, ?, ...)"
    const placeholders = Array(filteredKeys.length).fill('?').join(', ');
    // Repeat the row placeholders for every record.
    const placeholdersArr = Array(data.length).fill(`(${placeholders})`).join(', ');

    // Determine the primary key(s) to be used in the conflict target.
    const primaryKeys = keys.filter((key) => this._getRawAttributes[key].primaryKey);
    if (primaryKeys.length === 0) {
      throw new Error('No primary key defined for bulk upsert operation.');
    }

    // Build the update clause: update all columns that are not primary keys.
    const updateColumns = filteredKeys.filter((col) => !this._getRawAttributes[col].primaryKey);
    const updateClause = updateColumns.map((col) => `${col}=excluded.${col}`).join(', ');

    // Construct the full SQL.
    const sql = `INSERT INTO ${this.modelName} (${filteredKeys.join(', ')})
VALUES ${placeholdersArr}
ON CONFLICT (${primaryKeys.join(', ')})
DO UPDATE SET ${updateClause};`;

    // Execute the statement.
    const result = await this.getDB.execute(sql, values).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  static async update(data: Record<string, any>, options?: FindOptionsWhere) {
    if (!data) throw new Error('Data is undefined.');
    const { where = {} } = options || {};
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    const whereSql = whereKeys.length
      ? ` WHERE ${whereKeys.map((item) => `${item} = ?`).join(' AND ')}`
      : '';
    if (this._getRawAttributes.updatedAt) {
      data.updatedAt = this._getTimezoneDate;
    }
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `UPDATE ${this.modelName} SET ${keys
      .map((item) => `${item} = ?`)
      .join(', ')}${whereSql}`;
    const result = await this.getDB.execute(sql, [...values, ...whereValues]).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /**
   * find one data to table
   * @param options
   * @returns
   *
   * @example
   * ```ts
   * test.findOne({ where: { id: 1 } });
   * ```
   */
  static async findOne(options?: FindOptionsWhere) {
    const { where = {} } = options || {};
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    const whereSql = whereKeys.length
      ? ` WHERE ${whereKeys.map((item) => `${item} = ?`).join(' AND ')}`
      : ' WHERE 1=1';
    const paranoidSql = this._getRawAttributes.deletedAt
      ? ` AND ${this._getRawOptions.deletedAt} IS NULL`
      : '';
    const sql = `SELECT * FROM ${this.modelName}${whereSql}${paranoidSql} LIMIT 1`;
    const result = await this.getDB.select<any>(sql, whereValues).catch((error) => {
      throw new Error(error);
    });

    if (result.length) return result[0];

    return null;
  }

  /**
   * find all data to table
   * @param options
   * @returns
   *
   * @example
   * ```ts
   * test.findAll({
   *   where: {
   *     id: 1
   *   },
   *   limit: 10,
   *   offset: 0,
   *   order: ['id', 'DESC']
   * });
   * ```
   */
  static async findAll(options?: FindAllOptions) {
    const { where = {}, limit, offset, order } = options || {};
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    let paranoidSql = '';
    if (options?.paranoid === false || options?.paranoid === undefined) {
      paranoidSql = this._getRawOptions.deletedAt
        ? ` AND ${this._getRawOptions.deletedAt} IS NULL`
        : '';
    }
    const whereSql = whereKeys.length
      ? ` WHERE ${whereKeys.map((item) => `${item} = ?`).join(' AND ')}`
      : ' WHERE 1=1';
    const orderSql = order ? ` ORDER BY ${order}` : '';
    const limitSql = limit ? ` LIMIT ${limit}` : '';
    const offsetSql = offset ? ` OFFSET ${offset}` : '';
    const sql = `SELECT * FROM ${this.modelName}${whereSql}${paranoidSql}${orderSql}${limitSql}${offsetSql}`;
    const result = await this.getDB.select(sql, whereValues).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /**
   * if model has deletedAt, will update deletedAt
   * if model not has deletedAt or force is true, will delete data
   * @param options
   * @returns
   *
   * @example
   * ```ts
   * test.destroy({ where: { id: 1 } });
   * ```
   */
  static async destroy(options?: DestroyOptions) {
    const { where = {} } = options || {};
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    const whereSql = whereKeys.length
      ? ` WHERE ${whereKeys.map((item) => `${item} = ?`).join(' AND ')}`
      : '';
    let sql = '';
    if (options?.force || !this._getRawOptions.deletedAt) {
      sql = `DELETE FROM ${this.modelName}${whereSql}`;
    } else if (this._getRawOptions.deletedAt) {
      sql = `UPDATE ${this.modelName} SET ${this._getRawOptions.deletedAt} = '${this._getTimezoneDate}'${whereSql}`;
    }
    const result = await this.getDB.execute(sql, whereValues).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /** if model has deletedAt, will restore data */
  static async restore(options: RestoreOptions) {
    if (!options || !options.where) {
      throw new Error('options.where is required');
    }
    const keys = Object.keys(options.where);
    const values = Object.values(options.where);

    // if model not has deletedAt, throw error
    if (!this._getRawOptions.deletedAt) {
      throw new Error(`${this.modelName} not has deletedAt`);
    }

    // if model has deletedAt, will restore data by deletedAt
    // and updatedAt will update
    const sql = `UPDATE ${this.modelName} SET ${this._getRawOptions.deletedAt} = NULL, ${
      this._getRawOptions.updatedAt
    } = '${this._getTimezoneDate}' WHERE ${keys.map((key) => `${key} = ?`).join(' AND ')}`;
    const result = await this.getDB.execute(sql, values).catch((error) => {
      throw new Error(error);
    });

    return result;
  }

  /**
   * drop table
   * @returns
   */
  static async drop() {
    return await this.getDB.execute(`DROP TABLE IF EXISTS ${this.modelName}`).catch((error) => {
      throw new Error(error);
    });
  }
}

/** find primary key */
function findPrimaryKey(attributes: ModelAttributes) {
  if (!attributes) throw new Error('attributes is required');

  const keys = Object.keys(attributes);
  for (const key of keys) {
    if (attributes[key].primaryKey) return key;
  }
}

/** get timestamp properties */
function accessTimestamps(options: ModelOptions & Record<string, any>) {
  const timestampsProperties = {} as TimestampsProperties &
    Record<string, TimestampsTypeAndProperties>;
  if (options.timestamps) {
    const timestampKeys = ['createdAt', 'updatedAt', 'deletedAt'];

    for (const key of timestampKeys) {
      const timestampKey = typeof options[key] === 'string' ? options[key] : key;
      if (options[key] === false) continue;
      timestampsProperties[key] = {
        key: timestampKey,
        type: 'DATE',
        properties: {
          type: 'DATE',
          defaultValue: key === 'deletedAt' ? null : getLocalTime(options.timezone)
        }
      };
    }
  }

  return timestampsProperties;
}
