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
var fast_xml_parser_1 = require("fast-xml-parser");
var jsdom_1 = require("jsdom");
var slugify_1 = require("slugify");
var url_1 = require("url");
// Configuration
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var WORDPRESS_EXPORT_PATH = path_1.default.join(__dirname, 'data', 'flatearthequipment.WordPress.2025-05-08.xml');
var OUTPUT_DIR = path_1.default.join(__dirname, '..', 'content', 'insights');
// Priority categories in order
var PRIORITY_CATEGORIES = [
    'diagnostic-codes',
    'parts',
    'rental'
];
// Helper function to convert HTML to MDX
function convertHtmlToMdx(html) {
    var dom = new jsdom_1.JSDOM(html);
    var document = dom.window.document;
    // Convert headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function (heading) {
        var level = parseInt(heading.tagName[1]);
        heading.outerHTML = "\n".concat('#'.repeat(level), " ").concat(heading.textContent, "\n");
    });
    // Convert paragraphs
    document.querySelectorAll('p').forEach(function (p) {
        p.outerHTML = "\n".concat(p.textContent, "\n");
    });
    // Convert lists
    document.querySelectorAll('ul, ol').forEach(function (list) {
        var items = Array.from(list.querySelectorAll('li')).map(function (li) { return "- ".concat(li.textContent); }).join('\n');
        list.outerHTML = "\n".concat(items, "\n");
    });
    // Convert links
    document.querySelectorAll('a').forEach(function (link) {
        var href = link.href;
        link.outerHTML = "[".concat(link.textContent, "](").concat(href, ")");
    });
    // Convert images
    document.querySelectorAll('img').forEach(function (img) {
        var imgElement = img;
        var alt = imgElement.alt || '';
        var src = imgElement.src;
        img.outerHTML = "\n![".concat(alt, "](").concat(src, ")\n");
    });
    return document.body.textContent || '';
}
// Helper function to generate frontmatter
function generateFrontmatter(post) {
    return "---\ntitle: \"".concat(post.title, "\"\ndescription: \"").concat(post.description, "\"\nslug: \"").concat(post.slug, "\"\ndate: \"").concat(post.date, "\"\n---\n");
}
// Main conversion function
function convertWordPressToMdx() {
    return __awaiter(this, void 0, void 0, function () {
        var xmlContent, parser, result, posts, uniqueCategories_1, _i, posts_1, post, convertedCount, _loop_1, _a, posts_2, post;
        return __generator(this, function (_b) {
            try {
                xmlContent = fs_1.default.readFileSync(WORDPRESS_EXPORT_PATH, 'utf-8');
                parser = new fast_xml_parser_1.XMLParser();
                result = parser.parse(xmlContent);
                // Create output directory if it doesn't exist
                if (!fs_1.default.existsSync(OUTPUT_DIR)) {
                    fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
                }
                posts = result.rss.channel.item;
                console.log('First 5 posts:', JSON.stringify(posts.slice(0, 5), null, 2));
                uniqueCategories_1 = new Set();
                for (_i = 0, posts_1 = posts; _i < posts_1.length; _i++) {
                    post = posts_1[_i];
                    if (post.category) {
                        if (Array.isArray(post.category)) {
                            post.category.forEach(function (cat) { return uniqueCategories_1.add(cat); });
                        }
                        else {
                            uniqueCategories_1.add(post.category);
                        }
                    }
                }
                console.log('Unique categories found:', Array.from(uniqueCategories_1));
                convertedCount = 0;
                _loop_1 = function (post) {
                    // Skip if no category
                    if (!post.category)
                        return "continue";
                    // Handle category as string or array
                    var mainCategory = '';
                    if (Array.isArray(post.category)) {
                        mainCategory = post.category[0].toLowerCase();
                    }
                    else {
                        mainCategory = post.category.toLowerCase();
                    }
                    // Skip if not in priority categories
                    if (!PRIORITY_CATEGORIES.some(function (cat) { return mainCategory.includes(cat); }))
                        return "continue";
                    // Create category directory
                    var categoryDir = path_1.default.join(OUTPUT_DIR, mainCategory);
                    if (!fs_1.default.existsSync(categoryDir)) {
                        fs_1.default.mkdirSync(categoryDir, { recursive: true });
                    }
                    // Generate slug if not present
                    var slug = (post['wp:post_name'] && post['wp:post_name'].length > 0)
                        ? post['wp:post_name']
                        : (0, slugify_1.default)(post.title, { lower: true });
                    // Convert content
                    var mdxContent = convertHtmlToMdx(post['content:encoded'] || '');
                    // Use post date
                    var date = post['wp:post_date'] || '';
                    // Create MDX file
                    var outputPath = path_1.default.join(categoryDir, "".concat(slug, ".mdx"));
                    var frontmatter = generateFrontmatter({
                        title: post.title,
                        description: post.title,
                        slug: "".concat(mainCategory, "/").concat(slug),
                        date: date
                    });
                    fs_1.default.writeFileSync(outputPath, frontmatter + mdxContent);
                    convertedCount++;
                    console.log("Converted: ".concat(post.title));
                };
                for (_a = 0, posts_2 = posts; _a < posts_2.length; _a++) {
                    post = posts_2[_a];
                    _loop_1(post);
                }
                console.log("\nConversion complete! Converted ".concat(convertedCount, " posts."));
            }
            catch (error) {
                console.error('Error during conversion:', error);
            }
            return [2 /*return*/];
        });
    });
}
// Run the conversion
convertWordPressToMdx();
