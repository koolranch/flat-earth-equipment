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
function checkAndFixTestUser() {
    return __awaiter(this, void 0, void 0, function () {
        var testEmail_1, _a, userData, userError, testUser, _b, newUser, createError, currentUserId, _c, _d, course, courseError, _e, enrollment, enrollmentError, insertError, _f, modules, modulesError, error_1;
        var _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 13, , 14]);
                    console.log('🔍 Checking test user and enrollment status...');
                    testEmail_1 = 'flatearthequip@gmail.com';
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 1:
                    _a = _j.sent(), userData = _a.data, userError = _a.error;
                    if (userError) {
                        console.error('Error fetching users:', userError);
                        return [2 /*return*/];
                    }
                    testUser = userData.users.find(function (u) { return u.email === testEmail_1; });
                    if (!!testUser) return [3 /*break*/, 3];
                    console.log('❌ Test user not found in auth.users!');
                    console.log('🔧 Creating test user...');
                    return [4 /*yield*/, supabase.auth.admin.createUser({
                            email: testEmail_1,
                            password: 'TestPassword123!',
                            email_confirm: true,
                            user_metadata: {
                                full_name: 'Test User'
                            }
                        })];
                case 2:
                    _b = _j.sent(), newUser = _b.data, createError = _b.error;
                    if (createError) {
                        console.error('Error creating user:', createError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Test user created:', (_g = newUser.user) === null || _g === void 0 ? void 0 : _g.id);
                    console.log('📧 Email:', testEmail_1);
                    console.log('🔑 Password: TestPassword123!');
                    return [3 /*break*/, 4];
                case 3:
                    console.log('✅ Test user exists:', testUser.id);
                    console.log('📧 Email:', testUser.email);
                    _j.label = 4;
                case 4:
                    _c = (testUser === null || testUser === void 0 ? void 0 : testUser.id);
                    if (_c) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 5:
                    _c = ((_h = (_j.sent()).data.users.find(function (u) { return u.email === testEmail_1; })) === null || _h === void 0 ? void 0 : _h.id);
                    _j.label = 6;
                case 6:
                    currentUserId = _c;
                    if (!currentUserId) {
                        console.error('❌ Could not determine user ID');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title, slug')
                            .eq('slug', 'forklift')
                            .single()];
                case 7:
                    _d = _j.sent(), course = _d.data, courseError = _d.error;
                    if (courseError || !course) {
                        console.error('❌ Forklift course not found. Run the database fix script first!');
                        return [2 /*return*/];
                    }
                    console.log('📋 Found course:', course.title);
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .select('*')
                            .eq('user_id', currentUserId)
                            .eq('course_id', course.id)
                            .single()];
                case 8:
                    _e = _j.sent(), enrollment = _e.data, enrollmentError = _e.error;
                    if (!(enrollmentError || !enrollment)) return [3 /*break*/, 10];
                    console.log('❌ No enrollment found. Creating test enrollment...');
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .insert({
                            user_id: currentUserId,
                            course_id: course.id,
                            progress_pct: 14.3,
                            passed: false
                        })];
                case 9:
                    insertError = (_j.sent()).error;
                    if (insertError) {
                        console.error('Error creating enrollment:', insertError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Test enrollment created with 14.3% progress');
                    return [3 /*break*/, 11];
                case 10:
                    console.log('✅ Enrollment exists:', {
                        progress: enrollment.progress_pct + '%',
                        passed: enrollment.passed
                    });
                    _j.label = 11;
                case 11: return [4 /*yield*/, supabase
                        .from('modules')
                        .select('id, "order", title, type')
                        .eq('course_id', course.id)
                        .order('order')];
                case 12:
                    _f = _j.sent(), modules = _f.data, modulesError = _f.error;
                    if (modulesError) {
                        console.error('Error fetching modules:', modulesError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCDA Found ".concat(modules === null || modules === void 0 ? void 0 : modules.length, " modules:"));
                    modules === null || modules === void 0 ? void 0 : modules.forEach(function (module) {
                        console.log("  ".concat(module.order, ". ").concat(module.title, " (").concat(module.type, ")"));
                    });
                    console.log('\n🎉 Test user setup complete!');
                    console.log('\n🔐 Login credentials:');
                    console.log("\uD83D\uDCE7 Email: ".concat(testEmail_1));
                    console.log('🔑 Password: TestPassword123!');
                    console.log('\n🔗 Try logging in at: https://www.flatearthequipment.com/login');
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _j.sent();
                    console.error('Script error:', error_1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
checkAndFixTestUser();
