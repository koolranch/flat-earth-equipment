"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_flow_1 = require("dotenv-flow");
dotenv_flow_1.default.config();
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function checkPriceSyncStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, unprocessedUpdates, queueError, _b, failedUpdates, failedError, _c, recentParts, partsError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('price_update_queue')
                            .select('*')
                            .is('processed_at', null)
                            .order('created_at', { ascending: true })];
                case 1:
                    _a = _d.sent(), unprocessedUpdates = _a.data, queueError = _a.error;
                    if (queueError) {
                        throw queueError;
                    }
                    console.log('\n=== Price Update Queue Status ===');
                    console.log("Unprocessed updates: ".concat((unprocessedUpdates === null || unprocessedUpdates === void 0 ? void 0 : unprocessedUpdates.length) || 0));
                    if (unprocessedUpdates === null || unprocessedUpdates === void 0 ? void 0 : unprocessedUpdates.length) {
                        console.log('\nOldest unprocessed updates:');
                        unprocessedUpdates.slice(0, 5).forEach(function (update) {
                            console.log("- Created: ".concat(update.created_at));
                            console.log("  Part ID: ".concat(update.part_id));
                            console.log("  Old price: $".concat(update.old_price_cents / 100));
                            console.log("  New price: $".concat(update.new_price_cents / 100));
                            console.log('---');
                        });
                    }
                    return [4 /*yield*/, supabase
                            .from('price_update_queue')
                            .select('*')
                            .not('error', 'is', null)
                            .order('created_at', { ascending: false })
                            .limit(5)];
                case 2:
                    _b = _d.sent(), failedUpdates = _b.data, failedError = _b.error;
                    if (failedError) {
                        throw failedError;
                    }
                    if (failedUpdates === null || failedUpdates === void 0 ? void 0 : failedUpdates.length) {
                        console.log('\nRecent failed updates:');
                        failedUpdates.forEach(function (update) {
                            console.log("- Failed at: ".concat(update.processed_at));
                            console.log("  Part ID: ".concat(update.part_id));
                            console.log("  Error: ".concat(update.error));
                            console.log('---');
                        });
                    }
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .select('id, name, price_cents, stripe_price_id, updated_at')
                            .order('updated_at', { ascending: false })
                            .limit(5)];
                case 3:
                    _c = _d.sent(), recentParts = _c.data, partsError = _c.error;
                    if (partsError) {
                        throw partsError;
                    }
                    console.log('\n=== Recent Price Changes ===');
                    recentParts === null || recentParts === void 0 ? void 0 : recentParts.forEach(function (part) {
                        console.log("- ".concat(part.name));
                        console.log("  Price: $".concat(part.price_cents / 100));
                        console.log("  Stripe Price ID: ".concat(part.stripe_price_id));
                        console.log("  Last updated: ".concat(part.updated_at));
                        console.log('---');
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error('Error checking price sync status:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
checkPriceSyncStatus().catch(console.error);
