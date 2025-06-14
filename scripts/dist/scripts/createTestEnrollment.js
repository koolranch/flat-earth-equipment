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
function createTestEnrollment() {
    return __awaiter(this, void 0, void 0, function () {
        var testEmail, users, userId, _a, authData, authError, authUser, course, orderId, orderError, enrollmentError, enrollment, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    testEmail = 'flatearthequip@gmail.com';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .select('id')
                            .eq('email', testEmail)];
                case 2:
                    users = (_b.sent()).data;
                    userId = void 0;
                    if (!(!users || users.length === 0)) return [3 /*break*/, 4];
                    console.log("\u2139\uFE0F  User with email ".concat(testEmail, " not found in public.users table"));
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 3:
                    _a = _b.sent(), authData = _a.data, authError = _a.error;
                    if (authError) {
                        console.error('Error checking auth users:', authError);
                        return [2 /*return*/];
                    }
                    authUser = authData.users.find(function (u) { return u.email === testEmail; });
                    if (!authUser) {
                        console.log("\u274C No user found with email ".concat(testEmail));
                        console.log('Please create a user in Supabase Auth dashboard first');
                        return [2 /*return*/];
                    }
                    userId = authUser.id;
                    console.log("\u2705 Found user in auth.users: ".concat(userId));
                    return [3 /*break*/, 5];
                case 4:
                    userId = users[0].id;
                    console.log("\u2705 Found existing user: ".concat(userId));
                    _b.label = 5;
                case 5: return [4 /*yield*/, supabase
                        .from('courses')
                        .select('id, title')
                        .eq('slug', 'forklift')
                        .single()];
                case 6:
                    course = (_b.sent()).data;
                    if (!course) {
                        console.error('❌ Forklift course not found. Run the stub course SQL first!');
                        return [2 /*return*/];
                    }
                    console.log("\u2705 Found course: ".concat(course.title));
                    orderId = crypto.randomUUID();
                    return [4 /*yield*/, supabase
                            .from('orders')
                            .insert({
                            id: orderId,
                            user_id: userId,
                            course_id: course.id,
                            stripe_session_id: "cs_test_manual_".concat(Date.now()),
                            seats: 1,
                            amount_cents: 5900
                        })];
                case 7:
                    orderError = (_b.sent()).error;
                    if (orderError) {
                        console.error('❌ Error creating order:', orderError);
                        return [2 /*return*/];
                    }
                    console.log("\u2705 Created test order: ".concat(orderId));
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .insert({
                            user_id: userId,
                            course_id: course.id,
                            progress_pct: 0,
                            passed: false
                        })];
                case 8:
                    enrollmentError = (_b.sent()).error;
                    if (enrollmentError) {
                        if (enrollmentError.code === '23505') {
                            console.log('ℹ️  Enrollment already exists for this user and course');
                        }
                        else {
                            console.error('❌ Error creating enrollment:', enrollmentError);
                            return [2 /*return*/];
                        }
                    }
                    else {
                        console.log('✅ Created enrollment successfully!');
                    }
                    return [4 /*yield*/, supabase
                            .from('enrollments')
                            .select("\n        *,\n        course:courses(title)\n      ")
                            .eq('user_id', userId)
                            .eq('course_id', course.id)
                            .single()];
                case 9:
                    enrollment = (_b.sent()).data;
                    if (enrollment) {
                        console.log('\n✅ Test enrollment created successfully!');
                        console.log("   User: ".concat(testEmail));
                        console.log("   Course: ".concat(enrollment.course.title));
                        console.log("   Progress: ".concat(enrollment.progress_pct, "%"));
                        console.log('\n🎉 You can now log in and visit /dashboard to test the learning experience!');
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
createTestEnrollment();
