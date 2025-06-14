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
function syncAllVariants() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, parts, partsError, _i, parts_1, part, _b, variants, variantsError, _c, variants_1, variant, newPrice, updateError, err_1, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .select('id, name, stripe_product_id')
                            .not('stripe_product_id', 'is', null)];
                case 1:
                    _a = _d.sent(), parts = _a.data, partsError = _a.error;
                    if (partsError)
                        throw partsError;
                    console.log("Found ".concat(parts.length, " parts to process"));
                    _i = 0, parts_1 = parts;
                    _d.label = 2;
                case 2:
                    if (!(_i < parts_1.length)) return [3 /*break*/, 11];
                    part = parts_1[_i];
                    console.log("\nProcessing ".concat(part.name, ":"));
                    return [4 /*yield*/, supabase
                            .from('part_variants')
                            .select('*')
                            .eq('part_id', part.id)];
                case 3:
                    _b = _d.sent(), variants = _b.data, variantsError = _b.error;
                    if (variantsError) {
                        console.error('Error fetching variants:', variantsError);
                        return [3 /*break*/, 10];
                    }
                    if (!variants || variants.length === 0) {
                        console.log('No variants found for this part');
                        return [3 /*break*/, 10];
                    }
                    _c = 0, variants_1 = variants;
                    _d.label = 4;
                case 4:
                    if (!(_c < variants_1.length)) return [3 /*break*/, 10];
                    variant = variants_1[_c];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, stripe.prices.create({
                            product: part.stripe_product_id,
                            unit_amount: variant.price_cents,
                            currency: 'usd'
                        })];
                case 6:
                    newPrice = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('part_variants')
                            .update({ stripe_price_id: newPrice.id })
                            .eq('id', variant.id)];
                case 7:
                    updateError = (_d.sent()).error;
                    if (updateError) {
                        console.error('Error updating variant:', updateError);
                        return [3 /*break*/, 9];
                    }
                    console.log("\u2705 Synced variant ".concat(variant.firmware_version, ": ").concat(newPrice.id));
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _d.sent();
                    console.error('Error processing variant:', err_1);
                    return [3 /*break*/, 9];
                case 9:
                    _c++;
                    return [3 /*break*/, 4];
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11:
                    console.log('\n✅ Variant sync completed!');
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _d.sent();
                    console.error('Error syncing variants:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
syncAllVariants();
