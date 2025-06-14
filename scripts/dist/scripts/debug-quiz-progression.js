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
function debugQuizProgression() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, _b, modules, modulesError, _c, enrollment, enrollmentError, moduleCount, progressPerModule, i, unlockProgress, completionProgress, isUnlocked, isCompleted, module3UnlockProgress, shouldModule3BeUnlocked, module2CompletionProgress, updateError, testResponse, result, _d, _e, _f, apiError_1, error_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 15, , 16]);
                    console.log('🔍 Debugging Quiz Progression Issue...');
                    console.log('===============================================');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _g.sent(), course = _a.data, courseError = _a.error;
                    if (courseError || !course) {
                        console.error('❌ Error finding forklift course:', courseError);
                        return [2 /*return*/];
                    }
                    console.log('📋 Found course:', course.title);
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('id, "order", title, type, game_asset_key, intro_url, video_url, quiz_json')
                            .eq('course_id', course.id)
                            .order('order')];
                case 2:
                    _b = _g.sent(), modules = _b.data, modulesError = _b.error;
                    if (modulesError) {
                        console.error('❌ Error fetching modules:', modulesError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCDA Found ".concat(modules === null || modules === void 0 ? void 0 : modules.length, " modules:"));
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module) {
                        var hasQuiz = module.quiz_json && module.quiz_json.length > 0;
                        console.log("  ".concat(module.order, ". ").concat(module.title, " (type: ").concat(module.type || 'video', ", game: ").concat(module.game_asset_key || 'none', ", quiz: ").concat(hasQuiz ? '✅' : '❌', ")"));
                    });
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .select('id, user_id, progress_pct, passed')
                            .eq('course_id', course.id)
                            .single()];
                case 3:
                    _c = _g.sent(), enrollment = _c.data, enrollmentError = _c.error;
                    if (enrollmentError) {
                        console.error('❌ Error finding enrollment:', enrollmentError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCC8 Current enrollment:");
                    console.log("  - Progress: ".concat(enrollment.progress_pct, "%"));
                    console.log("  - Passed: ".concat(enrollment.passed));
                    console.log("  - Enrollment ID: ".concat(enrollment.id));
                    moduleCount = (modules === null || modules === void 0 ? void 0 : modules.length) || 0;
                    progressPerModule = 100 / moduleCount;
                    console.log("\n\uD83E\uDDEE Progression Calculation:");
                    console.log("  - Total modules: ".concat(moduleCount));
                    console.log("  - Progress per module: ".concat(progressPerModule.toFixed(2), "%"));
                    console.log("\n\uD83D\uDCCA Expected Progression:");
                    for (i = 1; i <= moduleCount; i++) {
                        unlockProgress = (i - 1) * progressPerModule;
                        completionProgress = i * progressPerModule;
                        isUnlocked = enrollment.progress_pct >= unlockProgress;
                        isCompleted = enrollment.progress_pct >= completionProgress;
                        console.log("  Module ".concat(i, ": Unlock at ").concat(unlockProgress.toFixed(1), "%, Complete at ").concat(completionProgress.toFixed(1), "% - ").concat(isUnlocked ? '🔓' : '🔒', " ").concat(isCompleted ? '✅' : '⭕'));
                    }
                    module3UnlockProgress = 2 * progressPerModule // Module 3 unlocks after completing Module 2
                    ;
                    shouldModule3BeUnlocked = enrollment.progress_pct >= module3UnlockProgress;
                    console.log("\n\uD83C\uDFAF Module 3 Analysis:");
                    console.log("  - Module 3 should unlock at: ".concat(module3UnlockProgress.toFixed(2), "%"));
                    console.log("  - Current progress: ".concat(enrollment.progress_pct, "%"));
                    console.log("  - Module 3 should be unlocked: ".concat(shouldModule3BeUnlocked ? '✅ YES' : '❌ NO'));
                    if (!!shouldModule3BeUnlocked) return [3 /*break*/, 5];
                    console.log("\n\uD83D\uDD27 FIXING PROGRESSION:");
                    module2CompletionProgress = 2 * progressPerModule;
                    console.log("  - Setting progress to ".concat(module2CompletionProgress.toFixed(2), "% (Module 2 completed)"));
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .update({
                            progress_pct: module2CompletionProgress,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', enrollment.id)];
                case 4:
                    updateError = (_g.sent()).error;
                    if (updateError) {
                        console.error('❌ Error updating progress:', updateError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Progress updated successfully!');
                    console.log("\n\uD83C\uDF89 Module 3 should now be unlocked!");
                    console.log('📍 Please refresh your dashboard to see the changes.');
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\n\u2705 Module 3 should already be unlocked based on current progress.");
                    console.log('🤔 If Module 3 is still locked, check:');
                    console.log('   - Browser console for JavaScript errors');
                    console.log('   - Network tab for failed API requests');
                    console.log('   - Try hard refresh (Cmd+Shift+R)');
                    _g.label = 6;
                case 6:
                    // Test the API directly
                    console.log("\n\uD83E\uDDEA Testing Progress API:");
                    _g.label = 7;
                case 7:
                    _g.trys.push([7, 13, , 14]);
                    return [4 /*yield*/, fetch("".concat(process.env.NEXT_PUBLIC_SUPABASE_URL.replace('supabase.co', 'supabase.co'), "/api/progress"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                enrollmentId: enrollment.id,
                                moduleOrder: 2 // Simulating Module 2 completion
                            })
                        })];
                case 8:
                    testResponse = _g.sent();
                    if (!testResponse.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, testResponse.json()];
                case 9:
                    result = _g.sent();
                    console.log('✅ Progress API test successful:', result);
                    return [3 /*break*/, 12];
                case 10:
                    _e = (_d = console).log;
                    _f = ['❌ Progress API test failed:', testResponse.status];
                    return [4 /*yield*/, testResponse.text()];
                case 11:
                    _e.apply(_d, _f.concat([_g.sent()]));
                    _g.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    apiError_1 = _g.sent();
                    console.log('❌ Progress API test error:', apiError_1);
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _g.sent();
                    console.error('❌ Script error:', error_1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
debugQuizProgression().catch(console.error);
