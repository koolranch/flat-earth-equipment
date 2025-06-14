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
function createFreshTestUser() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, testEmail, testPassword, _a, newUser, createError, _b, course, courseError, enrollmentError, _c, modules, modulesError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    console.log('🚀 Creating fresh test user...');
                    timestamp = Date.now();
                    testEmail = "test.user.".concat(timestamp, "@flatearthequipment.com");
                    testPassword = "TestUser".concat(timestamp, "!");
                    console.log('📧 Test Email:', testEmail);
                    console.log('🔑 Test Password:', testPassword);
                    return [4 /*yield*/, supabase.auth.admin.createUser({
                            email: testEmail,
                            password: testPassword,
                            email_confirm: true,
                            user_metadata: {
                                full_name: 'Test User'
                            }
                        })];
                case 1:
                    _a = _d.sent(), newUser = _a.data, createError = _a.error;
                    if (createError) {
                        console.error('❌ Error creating user:', createError);
                        return [2 /*return*/];
                    }
                    if (!newUser.user) {
                        console.error('❌ No user returned from creation');
                        return [2 /*return*/];
                    }
                    console.log('✅ Test user created:', newUser.user.id);
                    return [4 /*yield*/, supabase
                            .from('courses')
                            .select('id, title, slug')
                            .eq('slug', 'forklift')
                            .single()];
                case 2:
                    _b = _d.sent(), course = _b.data, courseError = _b.error;
                    if (courseError || !course) {
                        console.error('❌ Forklift course not found. Run the database fix script first!');
                        return [2 /*return*/];
                    }
                    console.log('📋 Found course:', course.title);
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .insert({
                            user_id: newUser.user.id,
                            course_id: course.id,
                            progress_pct: 25.0,
                            passed: false
                        })];
                case 3:
                    enrollmentError = (_d.sent()).error;
                    if (enrollmentError) {
                        console.error('❌ Error creating enrollment:', enrollmentError);
                        return [2 /*return*/];
                    }
                    console.log('✅ Test enrollment created with 25% progress');
                    return [4 /*yield*/, supabase
                            .from('modules')
                            .select('id, "order", title, type')
                            .eq('course_id', course.id)
                            .order('order')];
                case 4:
                    _c = _d.sent(), modules = _c.data, modulesError = _c.error;
                    if (modulesError) {
                        console.error('Error fetching modules:', modulesError);
                        return [2 /*return*/];
                    }
                    console.log("\n\uD83D\uDCDA Found ".concat(modules === null || modules === void 0 ? void 0 : modules.length, " modules for testing"));
                    console.log('\n🎉 Fresh test user created successfully!');
                    console.log('\n' + '='.repeat(60));
                    console.log('🔐 LOGIN CREDENTIALS:');
                    console.log('='.repeat(60));
                    console.log("\uD83D\uDCE7 Email: ".concat(testEmail));
                    console.log("\uD83D\uDD11 Password: ".concat(testPassword));
                    console.log('='.repeat(60));
                    console.log('\n🔗 Login at: https://www.flatearthequipment.com/login');
                    console.log('🏠 Dashboard: https://www.flatearthequipment.com/dashboard');
                    console.log('\n💡 This user has 25% progress so you can test:');
                    console.log('   • Login process');
                    console.log('   • Dashboard with partial completion');
                    console.log('   • Module progression');
                    console.log('   • Certificate generation (when completed)');
                    console.log('   • Fillable PDF evaluation form');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error('❌ Script error:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
createFreshTestUser();
