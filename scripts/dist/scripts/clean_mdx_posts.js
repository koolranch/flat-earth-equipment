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
var fs_1 = require("fs");
var path_1 = require("path");
var insightsDirectory = path_1.default.join(process.cwd(), 'content/insights');
function cleanWordPressContent(content) {
    // Remove WordPress HTML comments
    content = content.replace(/<!-- wp:.*? -->/g, '');
    content = content.replace(/<!-- \/wp:.*? -->/g, '');
    // Clean up HTML tags while preserving content
    content = content.replace(/<p>/g, '');
    content = content.replace(/<\/p>/g, '\n\n');
    content = content.replace(/<h2 class="wp-block-heading">/g, '## ');
    content = content.replace(/<\/h2>/g, '\n\n');
    content = content.replace(/<h3 class="wp-block-heading">/g, '### ');
    content = content.replace(/<\/h3>/g, '\n\n');
    content = content.replace(/<ul class="wp-block-list">/g, '');
    content = content.replace(/<\/ul>/g, '\n\n');
    content = content.replace(/<li>/g, '- ');
    content = content.replace(/<\/li>/g, '\n');
    content = content.replace(/<strong>/g, '**');
    content = content.replace(/<\/strong>/g, '**');
    content = content.replace(/<em>/g, '*');
    content = content.replace(/<\/em>/g, '*');
    content = content.replace(/<hr class="wp-block-separator has-alpha-channel-opacity"\/>/g, '---\n');
    // Clean up table formatting
    content = content.replace(/<figure class="wp-block-table"><table class="has-fixed-layout"><tbody>/g, '');
    content = content.replace(/<\/tbody><\/table><\/figure>/g, '\n\n');
    content = content.replace(/<tr>/g, '');
    content = content.replace(/<\/tr>/g, '\n');
    content = content.replace(/<th>/g, '| ');
    content = content.replace(/<\/th>/g, ' |');
    content = content.replace(/<td>/g, '| ');
    content = content.replace(/<\/td>/g, ' |');
    // Clean up any remaining HTML tags
    content = content.replace(/<[^>]+>/g, '');
    // Clean up extra newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    return content;
}
function cleanAllPosts() {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_1, file, filePath, content, frontmatterEnd, frontmatter, postContent, cleanedContent;
        return __generator(this, function (_a) {
            files = fs_1.default.readdirSync(insightsDirectory);
            for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                file = files_1[_i];
                if (!file.endsWith('.mdx'))
                    continue;
                filePath = path_1.default.join(insightsDirectory, file);
                content = fs_1.default.readFileSync(filePath, 'utf8');
                frontmatterEnd = content.indexOf('---', 3);
                if (frontmatterEnd === -1) {
                    console.error("No frontmatter found in ".concat(file));
                    continue;
                }
                frontmatter = content.slice(0, frontmatterEnd + 3);
                postContent = content.slice(frontmatterEnd + 3);
                cleanedContent = cleanWordPressContent(postContent);
                // Write back to file
                fs_1.default.writeFileSync(filePath, frontmatter + '\n' + cleanedContent);
                console.log("Cleaned ".concat(file));
            }
            return [2 /*return*/];
        });
    });
}
cleanAllPosts().catch(console.error);
