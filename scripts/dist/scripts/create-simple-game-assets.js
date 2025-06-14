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
var fs_1 = require("fs");
dotenv_flow_1.default.config();
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Create simple SVG assets for the game
var createSVGAsset = function (emoji, color) {
    if (color === void 0) { color = '#f97316'; }
    return "<svg width=\"128\" height=\"128\" viewBox=\"0 0 128 128\" xmlns=\"http://www.w3.org/2000/svg\">\n    <circle cx=\"64\" cy=\"64\" r=\"60\" fill=\"".concat(color, "\" stroke=\"#ffffff\" stroke-width=\"4\"/>\n    <text x=\"64\" y=\"80\" text-anchor=\"middle\" font-size=\"48\" font-family=\"Arial\">").concat(emoji, "</text>\n  </svg>");
};
var assets = {
    'vest.svg': createSVGAsset('🦺', '#ff6b35'),
    'fork_down.svg': createSVGAsset('⬇️', '#3b82f6'),
    'brake.svg': createSVGAsset('🛑', '#dc2626'),
    'bg.svg': "<svg width=\"400\" height=\"225\" viewBox=\"0 0 400 225\" xmlns=\"http://www.w3.org/2000/svg\">\n    <defs>\n      <pattern id=\"warehouse\" patternUnits=\"userSpaceOnUse\" width=\"50\" height=\"50\">\n        <rect width=\"50\" height=\"50\" fill=\"#f3f4f6\"/>\n        <rect x=\"0\" y=\"0\" width=\"25\" height=\"25\" fill=\"#e5e7eb\"/>\n        <rect x=\"25\" y=\"25\" width=\"25\" height=\"25\" fill=\"#e5e7eb\"/>\n      </pattern>\n    </defs>\n    <rect width=\"100%\" height=\"100%\" fill=\"url(#warehouse)\"/>\n    <text x=\"200\" y=\"120\" text-anchor=\"middle\" font-size=\"24\" font-family=\"Arial\" fill=\"#6b7280\">WAREHOUSE FLOOR</text>\n  </svg>"
};
function uploadGameAssets() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, filename, svgContent, filepath, fileBuffer, pngFilename, error, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    console.log('🎨 Creating and uploading game assets...');
                    // Create temp directory
                    if (!fs_1.default.existsSync('./temp-assets')) {
                        fs_1.default.mkdirSync('./temp-assets');
                    }
                    _i = 0, _a = Object.entries(assets);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], filename = _b[0], svgContent = _b[1];
                    filepath = "./temp-assets/".concat(filename);
                    // Write SVG file
                    fs_1.default.writeFileSync(filepath, svgContent);
                    console.log("\u2705 Created ".concat(filename));
                    fileBuffer = fs_1.default.readFileSync(filepath);
                    pngFilename = filename.replace('.svg', '.png');
                    return [4 /*yield*/, supabase.storage
                            .from('game')
                            .upload(pngFilename, fileBuffer, {
                            contentType: 'image/svg+xml',
                            upsert: true
                        })];
                case 2:
                    error = (_c.sent()).error;
                    if (error) {
                        console.error("\u274C Error uploading ".concat(pngFilename, ":"), error);
                    }
                    else {
                        console.log("\uD83D\uDE80 Uploaded ".concat(pngFilename, " to Supabase"));
                    }
                    // Clean up temp file
                    fs_1.default.unlinkSync(filepath);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Clean up temp directory
                    fs_1.default.rmdirSync('./temp-assets');
                    console.log('\n✨ All game assets created and uploaded!');
                    console.log('\n🎮 Module 1 should now work with fallback emojis and proper styling.');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    console.error('Script error:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
uploadGameAssets();
