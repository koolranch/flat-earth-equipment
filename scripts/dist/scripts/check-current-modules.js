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
dotenv_flow_1.default.config();
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function checkCurrentModules() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, _b, modules, modulesError, moduleOrders, expectedModules, _loop_1, _i, expectedModules_1, expected, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    console.log('🔍 Checking current modules state...');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, slug, title')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _c.sent(), course = _a.data, courseError = _a.error;
                    if (courseError || !course) {
                        console.error('Error finding forklift course:', courseError);
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCCB Found course: ".concat(course.title, " (ID: ").concat(course.id, ")"));
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('*')
                            .eq('course_id', course.id)
                            .order('order')];
                case 2:
                    _b = _c.sent(), modules = _b.data, modulesError = _b.error;
                    if (modulesError) {
                        console.error('Error fetching modules:', modulesError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCDA Found ".concat((modules === null || modules === void 0 ? void 0 : modules.length) || 0, " modules:"));
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module, index) {
                        console.log("\n".concat(index + 1, ". Order ").concat(module.order, ": ").concat(module.title));
                        console.log("   Type: ".concat(module.type));
                        console.log("   Video URL: ".concat(module.video_url ? '✅' : '❌'));
                        console.log("   Intro URL: ".concat(module.intro_url ? '✅' : '❌'));
                        console.log("   Game Asset Key: ".concat(module.game_asset_key || '❌'));
                        console.log("   Quiz JSON: ".concat(module.quiz_json ? '✅' : '❌'));
                    });
                    // Check what's missing and fix it
                    console.log('\n🔧 Fixing missing modules...');
                    moduleOrders = (modules === null || modules === void 0 ? void 0 : modules.map(function (m) { return m.order; })) || [];
                    expectedModules = [
                        { order: 1, title: 'Introduction', type: 'video' },
                        { order: 2, title: 'Module 1: Pre-Operation Inspection', type: 'game' },
                        { order: 3, title: 'Module 2: 8-Point Inspection', type: 'game' },
                        { order: 4, title: 'Module 3: Balance & Load Handling', type: 'game' },
                        { order: 5, title: 'Module 4: Hazard Hunt', type: 'game' }
                    ];
                    _loop_1 = function (expected) {
                        var existing;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    existing = modules === null || modules === void 0 ? void 0 : modules.find(function (m) { return m.order === expected.order; });
                                    if (!!existing) return [3 /*break*/, 2];
                                    console.log("\u274C Missing module at order ".concat(expected.order, ": ").concat(expected.title));
                                    // Create the missing module
                                    return [4 /*yield*/, createModule(course.id, expected.order, expected.title, expected.type)];
                                case 1:
                                    // Create the missing module
                                    _d.sent();
                                    return [3 /*break*/, 5];
                                case 2:
                                    if (!(existing.title !== expected.title || existing.type !== expected.type)) return [3 /*break*/, 4];
                                    console.log("\u26A0\uFE0F  Module ".concat(expected.order, " needs updating: ").concat(existing.title, " -> ").concat(expected.title));
                                    return [4 /*yield*/, updateModule(existing.id, expected.title, expected.type, expected.order)];
                                case 3:
                                    _d.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    console.log("\u2705 Module ".concat(expected.order, " looks good: ").concat(existing.title));
                                    _d.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, expectedModules_1 = expectedModules;
                    _c.label = 3;
                case 3:
                    if (!(_i < expectedModules_1.length)) return [3 /*break*/, 6];
                    expected = expectedModules_1[_i];
                    return [5 /*yield**/, _loop_1(expected)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('\n✅ Module check and fix complete!');
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function createModule(courseId, order, title, type) {
    return __awaiter(this, void 0, void 0, function () {
        var moduleData, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    moduleData = {
                        course_id: courseId,
                        order: order,
                        title: title,
                        type: type
                    };
                    // Set specific data for each module
                    if (order === 1) {
                        moduleData.video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/intro.mp4';
                        moduleData.quiz_json = [
                            { "q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1 },
                            { "q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1 }
                        ];
                    }
                    else if (order === 2) {
                        moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduleone.mp4';
                        moduleData.game_asset_key = 'module1';
                        moduleData.quiz_json = [
                            { "q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["High-visibility vest", "Noise-cancelling earbuds", "Hard-hat", "Steel-toe boots"], "answer": 1 },
                            { "q": "Forks should travel:", "choices": ["Touching the floor", "4–6 inches above the floor", "At axle height", "At eye level"], "answer": 1 }
                        ];
                    }
                    else if (order === 3) {
                        moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduletwo.mp4';
                        moduleData.game_asset_key = 'module2';
                        moduleData.quiz_json = [
                            { "q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1 },
                            { "q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1 }
                        ];
                    }
                    else if (order === 4) {
                        moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4';
                        moduleData.game_asset_key = 'module3';
                        moduleData.quiz_json = [
                            { "q": "What is the key to maintaining forklift stability?", "choices": ["Speed", "Load distribution within stability triangle", "Loud horn", "Bright lights"], "answer": 1 },
                            { "q": "When carrying a load, the forks should be:", "choices": ["High up", "Tilted back and 4-6 inches off ground", "Tilted forward", "At maximum height"], "answer": 1 }
                        ];
                    }
                    else if (order === 5) {
                        moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4';
                        moduleData.game_asset_key = 'module4';
                        moduleData.quiz_json = [
                            { "q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1 },
                            { "q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2 }
                        ];
                    }
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .insert(moduleData)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error creating module ".concat(order, ":"), error);
                    }
                    else {
                        console.log("\u2705 Created module ".concat(order, ": ").concat(title));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function updateModule(moduleId, title, type, order) {
    return __awaiter(this, void 0, void 0, function () {
        var updateData, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updateData = { title: title, type: type };
                    // Set specific data for each module based on order
                    if (order === 4) {
                        updateData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4';
                        updateData.game_asset_key = 'module3';
                        updateData.video_url = null;
                        updateData.quiz_json = [
                            { "q": "What is the key to maintaining forklift stability?", "choices": ["Speed", "Load distribution within stability triangle", "Loud horn", "Bright lights"], "answer": 1 },
                            { "q": "When carrying a load, the forks should be:", "choices": ["High up", "Tilted back and 4-6 inches off ground", "Tilted forward", "At maximum height"], "answer": 1 }
                        ];
                    }
                    else if (order === 5) {
                        updateData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4';
                        updateData.game_asset_key = 'module4';
                        updateData.video_url = null;
                        updateData.quiz_json = [
                            { "q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1 },
                            { "q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2 }
                        ];
                    }
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .update(updateData)
                            .eq('id', moduleId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error updating module ".concat(order, ":"), error);
                    }
                    else {
                        console.log("\u2705 Updated module ".concat(order, ": ").concat(title));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
checkCurrentModules();
