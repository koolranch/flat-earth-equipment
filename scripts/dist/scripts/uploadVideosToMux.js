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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/*
  node scripts/uploadVideosToMux.ts ./assets/videos/
  ─ uploads every mp4 in a local folder to Mux
  ─ writes (url, module_title) rows to public.modules
*/
var fs_1 = require("fs");
var path_1 = require("path");
var mux_node_1 = require("@mux/mux-node");
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_flow_1 = require("dotenv-flow");
dotenv_flow_1.default.config();
var mux = new mux_node_1.default({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET
});
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function main(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var files, order, course, _i, files_1, file, upload, asset, assetReady, checkAsset, playbackId, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    files = fs_1.default.readdirSync(dir).filter(function (f) { return f.endsWith('.mp4'); });
                    order = 1;
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    course = (_c.sent()).data;
                    if (!course) {
                        console.error('Forklift course not found!');
                        return [2 /*return*/];
                    }
                    _i = 0, files_1 = files;
                    _c.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 16];
                    file = files_1[_i];
                    console.log("Uploading ".concat(file, "..."));
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 14, , 15]);
                    return [4 /*yield*/, mux.video.uploads.create({
                            cors_origin: '*',
                            new_asset_settings: {
                                playback_policy: ['public']
                            }
                        })];
                case 4:
                    upload = _c.sent();
                    console.log("Upload created with URL: ".concat(upload.url));
                    return [4 /*yield*/, mux.video.assets.create({
                            inputs: [{
                                    url: "file://".concat(path_1.default.resolve(dir, file)) // This assumes local file access
                                }],
                            playback_policy: ['public']
                        })
                        // Wait for asset to be ready
                    ];
                case 5:
                    asset = _c.sent();
                    assetReady = false;
                    _c.label = 6;
                case 6:
                    if (!!assetReady) return [3 /*break*/, 13];
                    return [4 /*yield*/, mux.video.assets.retrieve(asset.id)];
                case 7:
                    checkAsset = _c.sent();
                    if (!(checkAsset.status === 'ready')) return [3 /*break*/, 9];
                    assetReady = true;
                    playbackId = (_b = (_a = checkAsset.playback_ids) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
                    if (!playbackId) {
                        console.error('No playback ID for', file);
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, supabase.from('modules').insert({
                            course_id: course.id,
                            order: order,
                            title: path_1.default.parse(file).name.replace(/-/g, ' ').replace(/_/g, ' '),
                            video_url: "https://stream.mux.com/".concat(playbackId, ".m3u8")
                        })];
                case 8:
                    _c.sent();
                    order++;
                    console.log("\u2705 ".concat(file, " \u2192 ").concat(playbackId));
                    return [3 /*break*/, 12];
                case 9:
                    if (!(checkAsset.status === 'errored')) return [3 /*break*/, 10];
                    console.error("Asset creation failed for ".concat(file));
                    return [3 /*break*/, 13];
                case 10:
                    console.log("Asset status: ".concat(checkAsset.status, ", waiting..."));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12: return [3 /*break*/, 6];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_1 = _c.sent();
                    console.error("Error processing ".concat(file, ":"), error_1);
                    return [3 /*break*/, 15];
                case 15:
                    _i++;
                    return [3 /*break*/, 2];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Note: For production use, you'd typically:
// 1. Upload videos to a cloud storage (S3, etc)
// 2. Provide the public URL to Mux
// 3. Or use Mux's direct upload feature with signed URLs
console.log("\nNote: This script assumes you have video files locally.\nFor production, consider:\n1. Uploading to cloud storage first\n2. Using Mux direct uploads with signed URLs\n3. Or manually creating assets in Mux dashboard\n");
main((_a = process.argv[2]) !== null && _a !== void 0 ? _a : './assets/videos').catch(console.error);
