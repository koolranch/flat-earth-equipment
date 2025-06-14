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
var stripe_1 = require("stripe");
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_flow_1 = require("dotenv-flow");
dotenv_flow_1.default.config();
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function syncAllPrices() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, parts, error, _i, parts_1, part, newPrice, updateError, err_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .select('id, name, price_cents, stripe_product_id, stripe_price_id')
                            .not('stripe_product_id', 'is', null)];
                case 1:
                    _a = _b.sent(), parts = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    console.log("Found ".concat(parts.length, " parts to sync"));
                    _i = 0, parts_1 = parts;
                    _b.label = 2;
                case 2:
                    if (!(_i < parts_1.length)) return [3 /*break*/, 8];
                    part = parts_1[_i];
                    console.log("\nProcessing ".concat(part.name, ":"));
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, stripe.prices.create({
                            product: part.stripe_product_id,
                            unit_amount: part.price_cents,
                            currency: 'usd'
                        })];
                case 4:
                    newPrice = _b.sent();
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .update({ stripe_price_id: newPrice.id })
                            .eq('id', part.id)];
                case 5:
                    updateError = (_b.sent()).error;
                    if (updateError) {
                        console.error('❌ Failed to update Supabase:', updateError);
                        return [3 /*break*/, 7];
                    }
                    console.log('✅ Successfully synced price:', {
                        name: part.name,
                        price: "$".concat(part.price_cents / 100),
                        newPriceId: newPrice.id
                    });
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    console.error('❌ Error processing part:', err_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log('\n✅ Price sync completed!');
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _b.sent();
                    console.error('Error syncing prices:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
syncAllPrices().catch(console.error);
