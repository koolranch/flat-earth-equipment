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
function fixModulesDirectly() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, deleteError, modules, _i, modules_1, moduleData, insertError, progressError, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    console.log('🔧 Fixing modules structure directly...');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title, slug')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _b.sent(), course = _a.data, courseError = _a.error;
                    if (courseError || !course) {
                        console.error('Error finding forklift course:', courseError);
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCCB Found course: ".concat(course.title));
                    // First, let's clean up by deleting ALL modules for this course
                    console.log('🗑️  Deleting existing modules...');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .delete()
                            .eq('course_id', course.id)];
                case 2:
                    deleteError = (_b.sent()).error;
                    if (deleteError) {
                        console.error('Error deleting modules:', deleteError);
                        return [2 /*return*/];
                    }
                    modules = [
                        {
                            course_id: course.id,
                            order: 1,
                            title: 'Introduction',
                            type: 'video',
                            video_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4',
                            intro_url: null,
                            game_asset_key: null,
                            quiz_json: [
                                { "q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1 },
                                { "q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1 }
                            ]
                        },
                        {
                            course_id: course.id,
                            order: 2,
                            title: 'Module 1: Pre-Operation Inspection',
                            type: 'game',
                            video_url: null,
                            intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
                            game_asset_key: 'module1',
                            quiz_json: [
                                { "q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1 },
                                { "q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1 }
                            ]
                        },
                        {
                            course_id: course.id,
                            order: 3,
                            title: 'Module 2: Pre-Operation Inspection',
                            type: 'game',
                            video_url: null,
                            intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduletwo.mp4',
                            game_asset_key: 'module2',
                            quiz_json: [
                                { "q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1 },
                                { "q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1 }
                            ]
                        },
                        {
                            course_id: course.id,
                            order: 4,
                            title: 'Module 3: Operating Procedures',
                            type: 'video',
                            video_url: 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8',
                            intro_url: null,
                            game_asset_key: null,
                            quiz_json: [
                                { "q": "What is the maximum travel speed in work areas?", "choices": ["5 mph", "10 mph", "15 mph"], "answer": 0 },
                                { "q": "When traveling with a load, the forks should be:", "choices": ["Raised high", "Tilted back and low", "Level with ground"], "answer": 1 }
                            ]
                        },
                        {
                            course_id: course.id,
                            order: 5,
                            title: 'Module 4: Workplace Safety',
                            type: 'video',
                            video_url: 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8',
                            intro_url: null,
                            game_asset_key: null,
                            quiz_json: [
                                { "q": "What percentage of forklift accidents involve pedestrians?", "choices": ["10%", "25%", "36%"], "answer": 2 },
                                { "q": "When should you sound the horn?", "choices": ["At intersections and blind spots", "Only in emergencies", "Every 30 seconds"], "answer": 0 }
                            ]
                        }
                    ];
                    // Insert the new modules
                    console.log('✨ Creating new module structure...');
                    _i = 0, modules_1 = modules;
                    _b.label = 3;
                case 3:
                    if (!(_i < modules_1.length)) return [3 /*break*/, 6];
                    moduleData = modules_1[_i];
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .insert(moduleData)];
                case 4:
                    insertError = (_b.sent()).error;
                    if (insertError) {
                        console.error("Error inserting module ".concat(moduleData.order, ":"), insertError);
                    }
                    else {
                        console.log("\u2705 Created: ".concat(moduleData.title));
                    }
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    // Update enrollment progress to 20% to unlock Module 2
                    console.log('📈 Setting enrollment progress to 20% to unlock Module 2...');
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .update({ progress_pct: 20 })
                            .eq('course_id', course.id)];
                case 7:
                    progressError = (_b.sent()).error;
                    if (progressError) {
                        console.error('Error updating progress:', progressError);
                    }
                    else {
                        console.log('✅ Progress set to 20% - Module 2 should now be unlocked!');
                    }
                    console.log('\n🎉 Module structure fixed! Your flow should now be:');
                    console.log('1. Introduction (video + quiz) ✅ Complete');
                    console.log('2. Module 1: Pre-Operation Inspection (moduleone.mp4 + game + quiz) 🔓 Unlocked');
                    console.log('3. Module 2: Pre-Operation Inspection (moduletwo.mp4 + game + quiz) 🔒 Locked');
                    console.log('4. Module 3: Operating Procedures (video + quiz) 🔒 Locked');
                    console.log('5. Module 4: Workplace Safety (video + quiz) 🔒 Locked');
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    console.error('Script error:', error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
fixModulesDirectly();
