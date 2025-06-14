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
var gray_matter_1 = require("gray-matter");
var axios_1 = require("axios");
var util_1 = require("util");
var stream_1 = require("stream");
var pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
var contentDir = path_1.default.join(process.cwd(), '..', 'content', 'insights');
var publicDir = path_1.default.join(process.cwd(), '..', 'public', 'images', 'insights');
// Ensure the public images directory exists
if (!fs_1.default.existsSync(publicDir)) {
    fs_1.default.mkdirSync(publicDir, { recursive: true });
}
function downloadImage(url, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var response, stream, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, axios_1.default)({
                        url: url,
                        method: 'GET',
                        responseType: 'stream',
                    })];
                case 1:
                    response = _a.sent();
                    stream = response.data;
                    filePath = path_1.default.join(publicDir, filename);
                    return [4 /*yield*/, pipelineAsync(stream, fs_1.default.createWriteStream(filePath))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, "/images/insights/".concat(filename)];
            }
        });
    });
}
function generateImageFilename(url) {
    var urlObj = new URL(url);
    var pathname = urlObj.pathname;
    var extension = path_1.default.extname(pathname) || '.jpg';
    var filename = path_1.default.basename(pathname, extension);
    var timestamp = Date.now();
    return "".concat(filename, "-").concat(timestamp).concat(extension);
}
function processMdxFile(filePath) {
    var content = fs_1.default.readFileSync(filePath, 'utf8');
    var _a = (0, gray_matter_1.default)(content), data = _a.data, mdxContent = _a.content;
    // Find all image URLs in the content
    var imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    var match;
    var newContent = mdxContent;
    var hasChanges = false;
    var _loop_1 = function () {
        var fullMatch = match[0], altText = match[1], imageUrl = match[2];
        if (imageUrl.startsWith('http')) {
            var filename_1 = generateImageFilename(imageUrl);
            var localPath = "/images/insights/".concat(filename_1);
            newContent = newContent.replace(fullMatch, "![".concat(altText, "](").concat(localPath, ")"));
            hasChanges = true;
            // Download the image
            downloadImage(imageUrl, filename_1)
                .then(function () { return console.log("Downloaded image: ".concat(filename_1)); })
                .catch(function (error) { return console.error("Error downloading image ".concat(imageUrl, ":"), error); });
        }
    };
    while ((match = imageRegex.exec(mdxContent)) !== null) {
        _loop_1();
    }
    if (hasChanges) {
        var newMdxContent = gray_matter_1.default.stringify(newContent, data);
        fs_1.default.writeFileSync(filePath, newMdxContent);
        console.log("Updated images in ".concat(path_1.default.basename(filePath)));
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
console.log('Processing MDX files for external images...');
walkDir(contentDir);
console.log('Done!');
