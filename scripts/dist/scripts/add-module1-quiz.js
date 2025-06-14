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
function addModule1Quiz() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, course, courseError, module1Quiz, updateError, _b, module1, verifyError, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    console.log('🔍 Adding quiz data to Module 1...');
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
                    module1Quiz = [
                        {
                            "q": "Which PPE item is optional when operating a forklift indoors?",
                            "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"],
                            "answer": 1
                        },
                        {
                            "q": "Before starting your shift, you should:",
                            "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"],
                            "answer": 1
                        },
                        {
                            "q": "What are the three key steps in the pre-operation check-off?",
                            "choices": ["PPE, Lower forks, Apply brake", "Start engine, Check fuel, Drive", "Honk horn, Turn lights, Move forward"],
                            "answer": 0
                        }
                    ];
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .update({ quiz_json: module1Quiz })
                            .eq('course_id', course.id)
                            .eq('"order"', 2)]; // Escape the order column name since it's a reserved word
                case 2:
                    updateError = (_d.sent()) // Escape the order column name since it's a reserved word
                    .error;
                    if (updateError) {
                        console.error('❌ Error updating Module 1 quiz:', updateError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Module 1 quiz data added successfully!');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('title, quiz_json')
                            .eq('course_id', course.id)
                            .eq('"order"', 2)
                            .single()];
                case 3:
                    _b = _d.sent(), module1 = _b.data, verifyError = _b.error;
                    if (verifyError) {
                        console.error('❌ Error verifying update:', verifyError);
                        return [2 /*return*/];
                    }
                    console.log('📝 Verified Module 1 now has', (_c = module1.quiz_json) === null || _c === void 0 ? void 0 : _c.length, 'quiz questions');
                    console.log('🎉 Module 1 game flow should now work: Video → Game → Quiz → Progress');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error('Script error:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
addModule1Quiz();
