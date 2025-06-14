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
var fs_1 = require("fs");
var path_1 = require("path");
var gray_matter_1 = require("gray-matter");
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: '.env.local' });
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
var insightsDirectory = path_1.default.join(process.cwd(), 'content/insights');
function syncInsightsToSupabase() {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_1, file, filePath, content, _a, data, mdxContent, slug, insight, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    files = fs_1.default.readdirSync(insightsDirectory)
                        .filter(function (file) { return file.endsWith('.mdx'); });
                    console.log("Found ".concat(files.length, " MDX files to sync"));
                    _i = 0, files_1 = files;
                    _b.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    filePath = path_1.default.join(insightsDirectory, file);
                    content = fs_1.default.readFileSync(filePath, 'utf8');
                    _a = (0, gray_matter_1.default)(content), data = _a.data, mdxContent = _a.content;
                    slug = file.replace(/\.mdx$/, '');
                    insight = {
                        slug: slug,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        keywords: data.keywords || [],
                        image: data.image || '/images/insights/default.jpg',
                        content: mdxContent
                    };
                    return [4 /*yield*/, supabase
                            .from('insights')
                            .upsert(insight, { onConflict: 'slug' })];
                case 2:
                    error = (_b.sent()).error;
                    if (error) {
                        console.error("\u274C Error syncing ".concat(slug, ":"), error);
                    }
                    else {
                        console.log("\u2705 Synced ".concat(slug));
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('✅ Finished syncing insights to Supabase');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('❌ Error:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
syncInsightsToSupabase();
