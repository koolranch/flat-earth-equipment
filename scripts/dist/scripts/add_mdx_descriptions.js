"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var gray_matter_1 = require("gray-matter");
var contentDir = path_1.default.join(process.cwd(), '..', 'content', 'insights');
function generateDescription(content) {
    // Get the first paragraph of content
    var firstParagraph = content.split('\n\n')[0];
    // Remove markdown syntax
    var cleanText = firstParagraph
        .replace(/[#*`_~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
    // Limit to 160 characters
    return cleanText.length > 160 ? cleanText.substring(0, 157) + '...' : cleanText;
}
function processMdxFile(filePath) {
    var content = fs_1.default.readFileSync(filePath, 'utf8');
    var _a = (0, gray_matter_1.default)(content), data = _a.data, mdxContent = _a.content;
    if (!data.description) {
        var description = generateDescription(mdxContent);
        var newFrontmatter = __assign(__assign({}, data), { description: description });
        var newContent = gray_matter_1.default.stringify(mdxContent, newFrontmatter);
        fs_1.default.writeFileSync(filePath, newContent);
        console.log("Added description to ".concat(path_1.default.basename(filePath)));
    }
}
function walkDir(dir) {
    var files = fs_1.default.readdirSync(dir);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path_1.default.join(dir, file);
        var stat = fs_1.default.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        }
        else if (file.endsWith('.mdx')) {
            processMdxFile(filePath);
        }
    }
}
// Start processing
console.log('Adding missing descriptions to MDX files...');
walkDir(contentDir);
console.log('Done!');
