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
function verifyModuleStructure() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, _b, modules, modulesError, issues_1, orderCounts_1, correctStructure, i, correct, current, updates, needsUpdate, updateError, finalModules, moduleCount, progressPerModule, i, unlockProgress, completionProgress, moduleName, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 10, , 11]);
                    console.log('🔍 Verifying Module Structure...');
                    console.log('===============================================');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _d.sent(), course = _a.data, courseError = _a.error;
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
                    _b = _d.sent(), modules = _b.data, modulesError = _b.error;
                    if (modulesError) {
                        console.error('❌ Error fetching modules:', modulesError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCDA Current Module Structure:");
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module) {
                        var hasQuiz = module.quiz_json && module.quiz_json.length > 0;
                        var hasVideo = module.video_url || module.intro_url;
                        console.log("  Order ".concat(module.order, ": ").concat(module.title));
                        console.log("    - Type: ".concat(module.type || 'video'));
                        console.log("    - Game: ".concat(module.game_asset_key || 'none'));
                        console.log("    - Video: ".concat(hasVideo ? '✅' : '❌'));
                        console.log("    - Quiz: ".concat(hasQuiz ? '✅' : '❌'));
                        console.log('');
                    });
                    issues_1 = [];
                    orderCounts_1 = {};
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module) {
                        // Count duplicate orders
                        if (orderCounts_1[module.order]) {
                            orderCounts_1[module.order]++;
                        }
                        else {
                            orderCounts_1[module.order] = 1;
                        }
                    });
                    // Find duplicate orders
                    Object.entries(orderCounts_1).forEach(function (_a) {
                        var order = _a[0], count = _a[1];
                        if (count > 1) {
                            issues_1.push("\u274C Duplicate order ".concat(order, " found ").concat(count, " times"));
                        }
                    });
                    // Check specific module issues
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module) {
                        if (module.title.includes('Module 4') && module.game_asset_key === 'module5') {
                            issues_1.push("\u274C Module 4 has wrong game_asset_key: ".concat(module.game_asset_key, " (should be module4)"));
                        }
                        if (module.title.includes('Module 4') && module.order !== 5) {
                            issues_1.push("\u274C Module 4 has wrong order: ".concat(module.order, " (expected around 5)"));
                        }
                    });
                    if (!(issues_1.length > 0)) return [3 /*break*/, 7];
                    console.log('🚨 Issues Found:');
                    issues_1.forEach(function (issue) { return console.log('  ' + issue); });
                    console.log('\n🔧 Fixing Module Structure...');
                    correctStructure = [
                        { order: 1, title: 'Introduction', type: 'video' },
                        { order: 2, title: 'Module 1: Pre-Operation Inspection', type: 'game', game_asset_key: 'module1' },
                        { order: 3, title: 'Module 2: 8-Point Inspection', type: 'game', game_asset_key: 'module2' },
                        { order: 4, title: 'Module 3: Balance & Load Handling', type: 'game', game_asset_key: 'module3' },
                        { order: 5, title: 'Module 4: Hazard Hunt', type: 'hybrid', game_asset_key: 'module4' },
                        { order: 6, title: 'Module 5: Advanced Operations', type: 'video' },
                        { order: 7, title: 'Course Completion', type: 'video' }
                    ];
                    i = 0;
                    _d.label = 3;
                case 3:
                    if (!(i < correctStructure.length)) return [3 /*break*/, 6];
                    correct = correctStructure[i];
                    current = modules === null || modules === void 0 ? void 0 : modules[i];
                    if (!current) return [3 /*break*/, 5];
                    updates = {};
                    needsUpdate = false;
                    if (current.order !== correct.order) {
                        updates.order = correct.order;
                        needsUpdate = true;
                    }
                    if (current.title !== correct.title) {
                        updates.title = correct.title;
                        needsUpdate = true;
                    }
                    if (current.type !== correct.type) {
                        updates.type = correct.type;
                        needsUpdate = true;
                    }
                    if (correct.game_asset_key && current.game_asset_key !== correct.game_asset_key) {
                        updates.game_asset_key = correct.game_asset_key;
                        needsUpdate = true;
                    }
                    if (!needsUpdate) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .update(updates)
                            .eq('id', current.id)];
                case 4:
                    updateError = (_d.sent()).error;
                    if (updateError) {
                        console.error("\u274C Error updating module ".concat(current.id, ":"), updateError);
                    }
                    else {
                        console.log("\u2705 Updated: ".concat(correct.title, " (order ").concat(correct.order, ")"));
                    }
                    _d.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('\n🎉 Module structure fixes completed!');
                    return [3 /*break*/, 8];
                case 7:
                    console.log('✅ No issues found with module structure!');
                    _d.label = 8;
                case 8:
                    // Verify the final structure
                    console.log('\n📋 Final Module Structure Verification:');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('id, "order", title, type, game_asset_key')
                            .eq('course_id', course.id)
                            .order('order')];
                case 9:
                    finalModules = (_d.sent()).data;
                    finalModules === null || finalModules === void 0 ? void 0 : finalModules.forEach(function (module) {
                        console.log("  ".concat(module.order, ". ").concat(module.title, " (").concat(module.type, ", game: ").concat(module.game_asset_key || 'none', ")"));
                    });
                    // Check progression logic with correct structure
                    console.log('\n🧮 Progression Logic Check:');
                    moduleCount = (finalModules === null || finalModules === void 0 ? void 0 : finalModules.length) || 0;
                    progressPerModule = 100 / moduleCount;
                    console.log("  - Total modules: ".concat(moduleCount));
                    console.log("  - Progress per module: ".concat(progressPerModule.toFixed(2), "%"));
                    console.log('');
                    console.log('Expected progression:');
                    for (i = 1; i <= moduleCount; i++) {
                        unlockProgress = (i - 1) * progressPerModule;
                        completionProgress = i * progressPerModule;
                        moduleName = ((_c = finalModules === null || finalModules === void 0 ? void 0 : finalModules[i - 1]) === null || _c === void 0 ? void 0 : _c.title) || "Module ".concat(i);
                        console.log("  ".concat(moduleName, ": Unlocks at ").concat(unlockProgress.toFixed(1), "%, Completes at ").concat(completionProgress.toFixed(1), "%"));
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _d.sent();
                    console.error('❌ Script error:', error_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
verifyModuleStructure().catch(console.error);
