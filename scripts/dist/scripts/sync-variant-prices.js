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
var fs_1 = require("fs");
var papaparse_1 = require("papaparse");
var dotenv_flow_1 = require("dotenv-flow");
dotenv_flow_1.default.config();
function syncVariantPrices() {
    return __awaiter(this, void 0, void 0, function () {
        var stripe, supabase, file, rows, _i, _a, row, variantId, priceCents, productId, newPrice, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
                    supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    file = fs_1.default.readFileSync('./data/part_variants.csv', 'utf8');
                    rows = papaparse_1.default.parse(file, { header: true, skipEmptyLines: true }).data;
                    _i = 0, _a = rows;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    row = _a[_i];
                    variantId = row.id;
                    priceCents = parseInt(row.price_cents, 10);
                    productId = row.stripe_product_id;
                    if (!productId) {
                        console.warn("Skipping variant ".concat(variantId, " \u2013 no stripe_product_id"));
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, stripe.prices.create({
                            product: productId,
                            unit_amount: priceCents,
                            currency: 'usd'
                        })];
                case 2:
                    newPrice = _b.sent();
                    return [4 /*yield*/, supabase
                            .from('part_variants')
                            .update({ stripe_price_id: newPrice.id })
                            .eq('id', variantId)];
                case 3:
                    error = (_b.sent()).error;
                    if (error) {
                        console.error("Failed to update variant ".concat(variantId, ":"), error);
                        return [3 /*break*/, 4];
                    }
                    console.log("\u2705 Variant ".concat(variantId, " synced: ").concat(newPrice.id));
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
syncVariantPrices().catch(console.error);
