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
var fs_1 = require("fs");
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// Load environment variables from the root .env file
dotenv.config({ path: path_1.default.resolve(__dirname, '../.env') });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variables');
}
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, brands, file;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabase.storage
                    .from('brand-logos')
                    .list('', { limit: 1000 })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw error;
                brands = (data !== null && data !== void 0 ? data : [])
                    .filter(function (obj) { return obj.name.endsWith('.webp') || obj.name.endsWith('.png'); })
                    .map(function (obj) {
                    var slug = obj.name.replace(/\.(webp|png|jpg|jpeg)$/i, '').toLowerCase();
                    var name = slug.replace(/-/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
                    var logoUrl = "".concat(process.env.NEXT_PUBLIC_SUPABASE_URL, "/storage/v1/object/public/brand-logos/").concat(obj.name);
                    return {
                        slug: slug,
                        name: name,
                        logoUrl: logoUrl,
                        intro: "Flat Earth Equipment supplies ".concat(name, " parts and selected rentals."),
                        seoTitle: "".concat(name, " Parts | Flat Earth Equipment"),
                        seoDescription: "Buy precision-fit ".concat(name, " parts online. Ships nationwide."),
                    };
                });
                file = "export interface BrandInfo {\n  slug: string;\n  name: string;\n  logoUrl: string;\n  intro: string;\n  seoTitle: string;\n  seoDescription: string;\n}\n\nexport const brands: BrandInfo[] = ".concat(JSON.stringify(brands, null, 2), ";");
                fs_1.default.writeFileSync(path_1.default.resolve(__dirname, '../lib/brands.ts'), file);
                console.log('✅ lib/brands.ts generated with', brands.length, 'brands');
                return [2 /*return*/];
        }
    });
}); })();
