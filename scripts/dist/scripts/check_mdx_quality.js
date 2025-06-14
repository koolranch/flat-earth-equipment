"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var INSIGHTS_DIR = path_1.default.join(__dirname, '..', 'content', 'insights');
var FRONTMATTER_FIELDS = ['title', 'description', 'slug', 'date'];
function getAllMdxFiles(dir) {
    var results = [];
    var list = fs_1.default.readdirSync(dir);
    list.forEach(function (file) {
        var filePath = path_1.default.join(dir, file);
        var stat = fs_1.default.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllMdxFiles(filePath));
        }
        else if (file.endsWith('.mdx')) {
            results.push(filePath);
        }
    });
    return results;
}
function parseFrontmatter(content) {
    var match = content.match(/^---([\s\S]*?)---/);
    if (!match)
        return {};
    var frontmatter = {};
    match[1].split('\n').forEach(function (line) {
        var _a = line.split(':'), key = _a[0], rest = _a.slice(1);
        if (key && rest.length) {
            frontmatter[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
        }
    });
    return frontmatter;
}
function checkForUnconvertedHtml(content) {
    // Look for common HTML tags
    return /<\/?[a-z][\s\S]*?>/i.test(content);
}
function checkForExternalImages(content) {
    var matches = Array.from(content.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g));
    return matches.map(function (m) { return m[1]; });
}
function checkForMissingAltText(content) {
    return /!\[\]\(/.test(content);
}
function checkMdxFile(filePath) {
    var content = fs_1.default.readFileSync(filePath, 'utf-8');
    var frontmatter = parseFrontmatter(content);
    var body = content.replace(/^---([\s\S]*?)---/, '').trim();
    var missingFields = FRONTMATTER_FIELDS.filter(function (f) { return !frontmatter[f]; });
    var emptyBody = body.length === 0;
    var hasHtml = checkForUnconvertedHtml(body);
    var externalImages = checkForExternalImages(body);
    var missingAlt = checkForMissingAltText(body);
    return {
        filePath: filePath,
        missingFields: missingFields,
        emptyBody: emptyBody,
        hasHtml: hasHtml,
        externalImages: externalImages,
        missingAlt: missingAlt
    };
}
function main() {
    var mdxFiles = getAllMdxFiles(INSIGHTS_DIR);
    var results = mdxFiles.map(checkMdxFile);
    var issues = 0;
    results.forEach(function (r) {
        if (r.missingFields.length ||
            r.emptyBody ||
            r.hasHtml ||
            r.externalImages.length ||
            r.missingAlt) {
            issues++;
            console.log("\n=== Issues in: ".concat(r.filePath, " ==="));
            if (r.missingFields.length)
                console.log('Missing frontmatter:', r.missingFields.join(', '));
            if (r.emptyBody)
                console.log('Body is empty');
            if (r.hasHtml)
                console.log('Unconverted HTML detected');
            if (r.externalImages.length)
                console.log('External images:', r.externalImages.join(', '));
            if (r.missingAlt)
                console.log('Images with missing alt text detected');
        }
    });
    if (!issues) {
        console.log('All MDX files passed quality checks!');
    }
    else {
        console.log("\n".concat(issues, " file(s) with issues found."));
    }
}
main();
