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
function verifyCoreCharges() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, parts, error, _i, parts_1, part, stripeProduct, err_1, stripePrice, err_2, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .select('id, name, has_core_charge, core_charge, stripe_price_id, stripe_product_id')
                            .eq('has_core_charge', true)];
                case 1:
                    _a = _b.sent(), parts = _a.data, error = _a.error;
                    if (error) {
                        throw error;
                    }
                    console.log("Found ".concat(parts.length, " parts with core charges"));
                    _i = 0, parts_1 = parts;
                    _b.label = 2;
                case 2:
                    if (!(_i < parts_1.length)) return [3 /*break*/, 11];
                    part = parts_1[_i];
                    console.log("\nVerifying ".concat(part.name, ":"));
                    if (!part.stripe_product_id) {
                        console.log('❌ Missing stripe_product_id');
                        return [3 /*break*/, 10];
                    }
                    if (!part.stripe_price_id) {
                        console.log('❌ Missing stripe_price_id');
                        return [3 /*break*/, 10];
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, stripe.products.retrieve(part.stripe_product_id)];
                case 4:
                    stripeProduct = _b.sent();
                    console.log('✅ Product exists in Stripe:', stripeProduct.id);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    console.log('❌ Product not found in Stripe');
                    return [3 /*break*/, 10];
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, stripe.prices.retrieve(part.stripe_price_id)];
                case 7:
                    stripePrice = _b.sent();
                    console.log('✅ Price exists in Stripe:', stripePrice.id);
                    return [3 /*break*/, 9];
                case 8:
                    err_2 = _b.sent();
                    console.log('❌ Price not found in Stripe');
                    return [3 /*break*/, 10];
                case 9:
                    // 5. Verify core charge amount
                    if (typeof part.core_charge !== 'number' || part.core_charge <= 0) {
                        console.log('❌ Invalid core charge amount:', part.core_charge);
                        return [3 /*break*/, 10];
                    }
                    console.log('✅ Core charge amount:', part.core_charge);
                    console.log('✅ All checks passed for this part');
                    _b.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    console.error('Error verifying core charges:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
verifyCoreCharges().catch(console.error);
