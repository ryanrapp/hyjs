import SqlDatabase, { QueryResult } from '@tauri-apps/plugin-sql';
import { DatabaseType, DestroyOptions, FindAllOptions, FindOptionsWhere, ModelAttributes, ModelDefineOptions, ModelOptions, RestoreOptions } from './type';
export default class Model {
    static db: SqlDatabase;
    static rawAttributes: Record<string, any>;
    static rawOptions: ModelOptions;
    static modelName: string;
    static _modelPrimaryKey?: string | null;
    static databaseType: DatabaseType;
    static get getDB(): SqlDatabase;
    static get _getRawAttributes(): Record<string, any>;
    static get _getRawOptions(): ModelOptions;
    static get _getTimezoneDate(): string;
    static _init(modelName: string, attributes: ModelAttributes, options: ModelDefineOptions): typeof Model;
    static _setRawOptions(options: ModelDefineOptions): Promise<void>;
    static _setTimestampsAttributes(attributes: ModelAttributes): Promise<void>;
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
    static sync(options?: {
        force?: boolean;
    }): Promise<{
        result: QueryResult;
        modelName: string;
    }>;
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
    static create(data: Record<string, any>): Promise<QueryResult>;
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
    static bulkCreate(data: Record<string, any>[]): Promise<QueryResult>;
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
    static bulkUpsert(data: Record<string, any>[]): Promise<QueryResult>;
    static update(data: Record<string, any>, options?: FindOptionsWhere): Promise<QueryResult>;
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
    static findOne(options?: FindOptionsWhere): Promise<any>;
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
    static findAll(options?: FindAllOptions): Promise<unknown>;
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
    static destroy(options?: DestroyOptions): Promise<QueryResult>;
    /** if model has deletedAt, will restore data */
    static restore(options: RestoreOptions): Promise<QueryResult>;
    /**
     * drop table
     * @returns
     */
    static drop(): Promise<QueryResult>;
}
