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
var child_process_1 = require("child_process");
// Get list of brand logos from CLI
console.log('Fetching brand logos from Supabase storage...');
var cliOutput = (0, child_process_1.execSync)('supabase storage ls ss:///brand-logos/ --experimental', { encoding: 'utf8' });
var brandLogos = cliOutput.split('\n').filter(function (name) { return name.endsWith('.webp') || name.endsWith('.png'); });
console.log("Found ".concat(brandLogos.length, " brand logos in storage"));
// Create Supabase client
var supabase = (0, supabase_js_1.createClient)('https://flat-earth-equipment.supabase.co', // Your project URL
process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' // Try both keys
);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, brandLogos_1, logoFile, publicUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, brandLogos_1 = brandLogos;
                    _a.label = 1;
                case 1:
                    if (!(_i < brandLogos_1.length)) return [3 /*break*/, 6];
                    logoFile = brandLogos_1[_i];
                    publicUrl = supabase
                        .storage
                        .from('brand-logos')
                        .getPublicUrl(logoFile).data.publicUrl;
                    console.log("".concat(logoFile, " \u2192 ").concat(publicUrl));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetch(publicUrl)];
                case 3:
                    response = _a.sent();
                    if (response.ok) {
                        console.log("\u2705 ".concat(logoFile, " is accessible"));
                    }
                    else {
                        console.error("\u274C ".concat(logoFile, " returned status ").concat(response.status));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C Error accessing ".concat(logoFile, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
run().catch(function (err) {
    console.error('Script error:', err);
    process.exit(1);
});
