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
function checkModule4Content() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, _b, module4, moduleError, needsFix, updates, updateError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    console.log('🔍 Checking Module 4 Content...');
                    console.log('===============================================');
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title')
                            .eq('slug', 'forklift')
                            .single()];
                case 1:
                    _a = _c.sent(), course = _a.data, courseError = _a.error;
                    if (courseError || !course) {
                        console.error('❌ Error finding forklift course:', courseError);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('*')
                            .eq('course_id', course.id)
                            .eq('"order"', 5) // Fixed: properly escape the order column
                            .single()];
                case 2:
                    _b = _c.sent(), module4 = _b.data, moduleError = _b.error;
                    if (moduleError || !module4) {
                        console.error('❌ Error finding Module 4:', moduleError);
                        return [2 /*return*/];
                    }
                    console.log('📋 Module 4 Details:');
                    console.log('Title:', module4.title);
                    console.log('Order:', module4.order);
                    console.log('Type:', module4.type);
                    console.log('Game Asset Key:', module4.game_asset_key);
                    console.log('');
                    console.log('📹 Video Content:');
                    console.log('video_url:', module4.video_url || '❌ NOT SET');
                    console.log('intro_url:', module4.intro_url || '❌ NOT SET');
                    console.log('');
                    console.log('🎮 Game Content:');
                    console.log('game_asset_key:', module4.game_asset_key || '❌ NOT SET');
                    console.log('');
                    console.log('📝 Quiz Content:');
                    if (module4.quiz_json && Array.isArray(module4.quiz_json)) {
                        console.log("\u2705 Has ".concat(module4.quiz_json.length, " quiz questions"));
                        module4.quiz_json.forEach(function (q, i) {
                            console.log("  Q".concat(i + 1, ": ").concat(q.q));
                        });
                    }
                    else {
                        console.log('❌ No quiz questions found');
                    }
                    // Check what content Module 4 should have
                    console.log('\n🎯 What Module 4 Should Have:');
                    console.log('- Video: modulefour.mp4 (workplace safety)');
                    console.log('- Game: module4 asset (hazard hunt game)');
                    console.log('- Quiz: 4+ questions about workplace safety');
                    needsFix = !module4.intro_url || !module4.game_asset_key || module4.game_asset_key !== 'module4';
                    if (!needsFix) return [3 /*break*/, 4];
                    console.log('\n🔧 Fixing Module 4 Content...');
                    updates = {
                        intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
                        game_asset_key: 'module4',
                        quiz_json: [
                            {
                                "q": "What percentage of forklift accidents involve pedestrians?",
                                "choices": ["10%", "25%", "36%"],
                                "answer": 2
                            },
                            {
                                "q": "When should you sound the horn?",
                                "choices": ["At intersections and blind spots", "Only in emergencies", "Every 30 seconds"],
                                "answer": 0
                            },
                            {
                                "q": "Safe distance from other forklifts:",
                                "choices": ["3 truck lengths", "1 truck length", "5 feet"],
                                "answer": 0
                            },
                            {
                                "q": "What should you do when you identify a workplace hazard?",
                                "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"],
                                "answer": 1
                            }
                        ]
                    };
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .update(updates)
                            .eq('id', module4.id)];
                case 3:
                    updateError = (_c.sent()).error;
                    if (updateError) {
                        console.error('❌ Error updating Module 4:', updateError);
                    }
                    else {
                        console.log('✅ Module 4 content updated successfully!');
                        console.log('📹 Video: modulefour.mp4');
                        console.log('🎮 Game: module4 (hazard hunt)');
                        console.log('📝 Quiz: 4 workplace safety questions');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    console.log('\n✅ Module 4 content looks correct!');
                    _c.label = 5;
                case 5:
                    // Also check what the frontend expects for hybrid modules
                    console.log('\n🖥️  Frontend Display Logic:');
                    console.log('Type "hybrid" should show:');
                    console.log('1. Video from intro_url');
                    console.log('2. Game component with game_asset_key');
                    console.log('3. Quiz modal after game completion');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error('❌ Script error:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
checkModule4Content().catch(console.error);
