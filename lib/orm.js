var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import SqlDatabase from '@tauri-apps/plugin-sql';
import Model from './model';
/**
 * #### SQL ORM
 *
 * The path is relative to `tauri::api::path::BaseDirectory::App`
 *
 * and must start with `sqlite:` or `mysql:` or `postgres:`
 *
 * @class SqlORM
 * @example
 *
 * ``` ts
 * const sqlite = new SqlORM('sqlite:test.db');
 * const mysql = new SqlORM('mysql://root:root@localhost/database');
 * const postgres = new SqlORM('postgres://postgres:root@localhost:5432/postgres');
 * ```
 */
var SqlORM = /** @class */ (function () {
    function SqlORM(path) {
        /** database instance */
        this.db = null;
        /** database path */
        this.path = '';
        this.path = path;
        this.databaseType = path.split(':')[0];
        this.connect();
    }
    Object.defineProperty(SqlORM.prototype, "getDB", {
        get: function () {
            return this.db;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * #### Define a model
     * @param modelName
     * @param attributes
     * @param options
     * @example
     * ``` ts
     * const Test = test.define('test', {
     *   id: {
     *     type: DataTypes.INTEGER,
     *     primaryKey: true,
     *     autoIncrement: true
     *   },
     *   name: {
     *     type: DataTypes.TEXT,
     *     allowNull: false
     *   }
     * });
     * ```
     * @returns
     */
    SqlORM.prototype.define = function (modelName, attributes, options) {
        if (attributes === void 0) { attributes = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, model;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options.modelName = modelName;
                        _a = options;
                        return [4 /*yield*/, this.getDB];
                    case 1:
                        _a.db = _b.sent();
                        options.databaseType = this.databaseType;
                        model = /** @class */ (function (_super) {
                            __extends(model, _super);
                            function model() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            return model;
                        }(Model));
                        model._init(modelName, attributes, options);
                        return [2 /*return*/, model];
                }
            });
        });
    };
    /** Connect to the database */
    SqlORM.prototype.connect = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.path)
                            throw new Error('Database path is not defined.');
                        this.db = SqlDatabase.load(this.path).catch(function (error) {
                            throw new Error(error);
                        });
                        return [4 /*yield*/, this.getDB];
                    case 1:
                        _a.sent();
                        if (callback && typeof callback === 'function')
                            callback();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Close the database */
    SqlORM.prototype.close = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db];
                    case 1:
                        (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.close();
                        this.db = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    return SqlORM;
}());
export default SqlORM;
