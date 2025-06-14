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
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function fixModule4Type() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, _b, module4Before, beforeError, updateError, _c, module4After, afterError, workingModules, error_1;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    console.log('🔧 Fixing Module 4 Type...');
                    console.log('===============================================');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _e.sent(), course = _a.data, courseError = _a.error;
                    if (courseError || !course) {
                        console.error('❌ Error finding forklift course:', courseError);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('id, title, type, game_asset_key, intro_url, video_url, quiz_json')
                            .eq('course_id', course.id)
                            .eq('"order"', 5)
                            .single()];
                case 2:
                    _b = _e.sent(), module4Before = _b.data, beforeError = _b.error;
                    if (beforeError || !module4Before) {
                        console.error('❌ Error finding Module 4:', beforeError);
                        return [2 /*return*/];
                    }
                    console.log('📋 Module 4 BEFORE Fix:');
                    console.log('  Title:', module4Before.title);
                    console.log('  Type:', module4Before.type);
                    console.log('  Game Asset Key:', module4Before.game_asset_key);
                    console.log('  Has intro_url:', !!module4Before.intro_url);
                    console.log('  Has quiz:', !!module4Before.quiz_json);
                    console.log('');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .update({
                            type: 'game', // Change from 'hybrid' to 'game'
                            video_url: null, // Game modules use intro_url, not video_url
                            // Keep existing intro_url, game_asset_key, and quiz_json
                        })
                            .eq('id', module4Before.id)];
                case 3:
                    updateError = (_e.sent()).error;
                    if (updateError) {
                        console.error('❌ Error updating Module 4:', updateError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Module 4 updated successfully!');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('id, title, type, game_asset_key, intro_url, video_url, quiz_json')
                            .eq('course_id', course.id)
                            .eq('"order"', 5)
                            .single()];
                case 4:
                    _c = _e.sent(), module4After = _c.data, afterError = _c.error;
                    if (afterError) {
                        console.error('❌ Error verifying Module 4:', afterError);
                        return [2 /*return*/];
                    }
                    console.log('📋 Module 4 AFTER Fix:');
                    console.log('  Title:', module4After.title);
                    console.log('  Type:', module4After.type);
                    console.log('  Game Asset Key:', module4After.game_asset_key);
                    console.log('  intro_url:', module4After.intro_url ? '✅ HAS VIDEO' : '❌ NO VIDEO');
                    console.log('  video_url:', module4After.video_url ? '⚠️ SHOULD BE NULL' : '✅ NULL');
                    console.log('  Quiz questions:', ((_d = module4After.quiz_json) === null || _d === void 0 ? void 0 : _d.length) || 0);
                    console.log('');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('title, type, game_asset_key, intro_url, video_url')
                            .eq('course_id', course.id)
                            .in('"order"', [2, 3, 4]) // Module 1, 2, 3 (which work)
                            .order('"order"')];
                case 5:
                    workingModules = (_e.sent()).data;
                    console.log('🔍 Comparison with Working Modules:');
                    workingModules === null || workingModules === void 0 ? void 0 : workingModules.forEach(function (mod) {
                        console.log("  ".concat(mod.title, ": type=").concat(mod.type, ", game=").concat(mod.game_asset_key, ", intro=").concat(!!mod.intro_url, ", video=").concat(!!mod.video_url));
                    });
                    console.log("  ".concat(module4After.title, ": type=").concat(module4After.type, ", game=").concat(module4After.game_asset_key, ", intro=").concat(!!module4After.intro_url, ", video=").concat(!!module4After.video_url));
                    console.log('');
                    console.log('🎯 Expected Result:');
                    console.log('  - Module 4 should now appear with video + game + quiz');
                    console.log('  - Type "game" will use HybridModule component');
                    console.log('  - intro_url provides the video');
                    console.log('  - game_asset_key "module4" loads MiniHazard component');
                    console.log('  - Quiz appears after game completion');
                    console.log('');
                    console.log('🔄 Please refresh your dashboard to see Module 4 content!');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _e.sent();
                    console.error('❌ Script error:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
fixModule4Type().catch(console.error);
