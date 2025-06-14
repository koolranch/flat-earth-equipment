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
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var shippingRates, _i, _a, rate, freeShipping, defaultShipping, error_1;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.shippingRates.list({
                            limit: 10,
                        })];
                case 1:
                    shippingRates = _f.sent();
                    console.log('📦 Found shipping rates:', shippingRates.data.length);
                    // Check each shipping rate
                    for (_i = 0, _a = shippingRates.data; _i < _a.length; _i++) {
                        rate = _a[_i];
                        console.log('\nShipping Rate:', {
                            id: rate.id,
                            display_name: rate.display_name,
                            active: rate.active,
                            amount: (_b = rate.fixed_amount) === null || _b === void 0 ? void 0 : _b.amount,
                            currency: (_c = rate.fixed_amount) === null || _c === void 0 ? void 0 : _c.currency,
                        });
                    }
                    freeShipping = shippingRates.data.find(function (r) { return r.id === 'shr_1RZdQkHJI548rO8JQOmkLnwc'; });
                    defaultShipping = shippingRates.data.find(function (r) { return r.id === 'shr_1RZdinHJI548rO8JYgwzuQuP'; });
                    console.log('\n🔍 Specific Shipping Rates:');
                    console.log('Free Shipping:', freeShipping ? {
                        id: freeShipping.id,
                        active: freeShipping.active,
                        amount: (_d = freeShipping.fixed_amount) === null || _d === void 0 ? void 0 : _d.amount,
                    } : 'Not found');
                    console.log('Default Shipping:', defaultShipping ? {
                        id: defaultShipping.id,
                        active: defaultShipping.active,
                        amount: (_e = defaultShipping.fixed_amount) === null || _e === void 0 ? void 0 : _e.amount,
                    } : 'Not found');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _f.sent();
                    console.error('❌ Error verifying shipping rates:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();
