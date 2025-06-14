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
exports.generateEvaluationPDF = generateEvaluationPDF;
var pdf_lib_1 = require("pdf-lib");
var dayjs_1 = require("dayjs");
var fs_1 = require("fs");
var path_1 = require("path");
/* Brand assets & palette */
var CDN = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand/';
var LOGO = CDN + 'logo_128.png';
var ORANGE = (0, pdf_lib_1.rgb)(1, 0.478, 0.133);
var TEAL = (0, pdf_lib_1.rgb)(0, 0.545, 0.553);
var GRAY = (0, pdf_lib_1.rgb)(0.55, 0.55, 0.55);
function generateEvaluationPDF(data) {
    return __awaiter(this, void 0, void 0, function () {
        var pdf, page, _a, width, height, form, font, bold, ital, logoBytes, logo, e_1, titleText, titleWidth, badgeW, badgeH, badgeY, contact, underline, tf, colW, rows, tableY, sigY, sig, comments, qrBuf, qr, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    pdf = _b.sent();
                    pdf.setTitle('Flat Earth Equipment – Forklift Practical Evaluation');
                    pdf.setLanguage('en-US');
                    pdf.setAuthor('Flat Earth Equipment');
                    pdf.setSubject('OSHA 29 CFR 1910.178(m) Practical Evaluation Form');
                    page = pdf.addPage([612, 792]) // portrait Letter
                    ;
                    _a = page.getSize(), width = _a.width, height = _a.height;
                    form = pdf.getForm();
                    return [4 /*yield*/, pdf.embedFont(pdf_lib_1.StandardFonts.Helvetica)];
                case 2:
                    font = _b.sent();
                    return [4 /*yield*/, pdf.embedFont(pdf_lib_1.StandardFonts.HelveticaBold)];
                case 3:
                    bold = _b.sent();
                    return [4 /*yield*/, pdf.embedFont(pdf_lib_1.StandardFonts.HelveticaOblique)
                        /* -- header -- */
                    ];
                case 4:
                    ital = _b.sent();
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, fetch(LOGO).then(function (r) { return r.arrayBuffer(); })];
                case 6:
                    logoBytes = _b.sent();
                    return [4 /*yield*/, pdf.embedPng(logoBytes)];
                case 7:
                    logo = _b.sent();
                    page.drawImage(logo, { x: 40, y: height - 100, width: 80, height: 80 });
                    /* footer logo */
                    page.drawImage(logo, { x: 40, y: 4, width: 26, height: 26 });
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _b.sent();
                    console.warn('Logo not loaded:', e_1);
                    return [3 /*break*/, 9];
                case 9:
                    // orange accent bar
                    page.drawRectangle({ x: 0, y: height - 120, width: width, height: 10, color: ORANGE });
                    titleText = 'Flat Earth Equipment – Forklift Operator Practical Evaluation';
                    titleWidth = bold.widthOfTextAtSize(titleText, 16);
                    page.drawText(titleText, {
                        x: (width - titleWidth) / 2,
                        y: height - 138,
                        size: 16,
                        font: bold,
                        color: (0, pdf_lib_1.rgb)(0.12, 0.15, 0.25)
                    });
                    badgeW = 120, badgeH = 22;
                    badgeY = height - 160;
                    page.drawRectangle({ x: width - badgeW - 40, y: badgeY, width: badgeW, height: badgeH, color: TEAL });
                    page.drawText('29 CFR 1910.178', {
                        x: width - badgeW - 40 + 8,
                        y: badgeY + 6,
                        size: 9,
                        font: bold,
                        color: (0, pdf_lib_1.rgb)(1, 1, 1)
                    });
                    contact = 'www.flatearthequipment.com   |   contact@flatearthequipment.com   |   (307) 302-0043';
                    page.drawText(contact, { x: 40, y: height - 155, size: 9, font: font, color: GRAY });
                    underline = function (x, y, w) { return page.drawLine({ start: { x: x, y: y }, end: { x: x + w, y: y }, thickness: 0.5, color: GRAY }); };
                    /* header field labels */
                    page.drawText('Operator Name / ID', { x: 40, y: height - 185, size: 10, font: bold });
                    page.drawText('Date', { x: width / 2 + 20, y: height - 185, size: 10, font: bold });
                    page.drawText('Evaluator Name / Title', { x: 40, y: height - 220, size: 10, font: bold });
                    page.drawText('Equipment Type / ID', { x: 40, y: height - 255, size: 10, font: bold });
                    tf = function (name, x, y, w, value) {
                        var f = form.createTextField(name);
                        f.addToPage(page, { x: x, y: y, width: w, height: 16, borderWidth: 0 }); // invisible border
                        f.setFontSize(10);
                        if (value)
                            f.setText(value);
                        underline(x, y - 3, w);
                        return f;
                    };
                    tf('operator_name', 40, height - 203, 190, data.operatorName);
                    tf('operator_id', 240, height - 203, 90, data.operatorId);
                    tf('eval_date', width / 2 + 20, height - 203, 110, (0, dayjs_1.default)(data.date).format('YYYY-MM-DD'));
                    tf('evaluator_name', 40, height - 238, 200, data.evaluatorName);
                    tf('evaluator_title', 255, height - 238, 150, data.evaluatorTitle);
                    tf('equip_type', 40, height - 273, 200, data.equipmentType);
                    tf('equip_id', 255, height - 273, 150, data.equipmentId);
                    /* instructional blurb */
                    page.drawText('Mark "Yes" only when the operator demonstrates each action safely and unaided.', { x: 40, y: height - 298, size: 10, font: ital });
                    colW = (width - 80) / 2;
                    rows = [
                        ['pre_fluid', 'Fluid levels, tires, forks, mast, devices', 'op_mount', 'Mount / Dismount (3-point)'],
                        ['pre_belt', 'Seatbelt usage', 'op_load', 'Load handling & tilt back'],
                        ['op_speed', 'Travel speed <= 5 mph', 'op_horn', 'Horn at intersections'],
                        ['op_ped', 'Pedestrian awareness', 'op_ramp', 'Ramp parking technique'],
                        ['park_proc', 'Parking procedure', 'op_control', 'Overall smooth control']
                    ];
                    tableY = height - 316;
                    rows.forEach(function (r) {
                        var id1 = r[0], txt1 = r[1], id2 = r[2], txt2 = r[3];
                        [[id1, txt1, 0], [id2, txt2, 1]].forEach(function (_a) {
                            var id = _a[0], txt = _a[1], col = _a[2];
                            var x = 40 + col * colW;
                            var cb = form.createCheckBox(id);
                            cb.addToPage(page, { x: x, y: tableY - 12, width: 18, height: 18, borderWidth: 1, borderColor: TEAL });
                            page.drawText(txt, { x: x + 24, y: tableY - 4, size: 11, font: font });
                        });
                        tableY -= 32;
                    });
                    /* certification blurb */
                    page.drawText('I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(m). Any "No" requires remediation and retest.', { x: 40, y: tableY - 18, size: 9, font: font });
                    page.drawText('This PDF is fill-able; tap boxes or fields on any phone or desktop.', { x: 40, y: tableY - 35, size: 8, font: ital, color: GRAY });
                    sigY = tableY - 78;
                    sig = form.createTextField('sig_evaluator');
                    sig.addToPage(page, { x: 40, y: sigY, width: width / 2 - 60, height: 60, borderWidth: 1, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0) });
                    sig.setFontSize(10);
                    tf('sig_date', width / 2 + 20, sigY + 22, 120);
                    page.drawText('Evaluator signature', { x: 40, y: sigY - 18, size: 8, font: font });
                    page.drawText('Date', { x: width / 2 + 20, y: sigY - 18, size: 8, font: font });
                    /* comments */
                    page.drawText('Additional Comments / Corrective Actions', { x: 40, y: sigY - 55, size: 10, font: bold });
                    comments = form.createTextField('comments');
                    comments.enableMultiline();
                    comments.addToPage(page, { x: 40, y: sigY - 150, width: width - 80, height: 90, borderWidth: 0 });
                    page.drawRectangle({ x: 40, y: sigY - 150, width: width - 80, height: 90, borderWidth: 0.5, borderColor: GRAY });
                    /* footer */
                    page.drawRectangle({ x: 0, y: 0, width: width, height: 34, color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95) });
                    page.drawText('Flat Earth Safety™ · Built Western Tough', { x: 74, y: 10, size: 8, font: font, color: (0, pdf_lib_1.rgb)(0.25, 0.25, 0.25) });
                    page.drawText("Form v".concat(data.version, " | Retain 3 years"), { x: width / 2 - 48, y: 10, size: 8, font: font, color: GRAY });
                    page.drawText('Page 1 of 1', { x: width - 90, y: 10, size: 8, font: font, color: GRAY });
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 13, , 14]);
                    return [4 /*yield*/, fetch("https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=".concat(encodeURIComponent('https://flatearthequipment.com/eval-help'))).then(function (r) { return r.arrayBuffer(); })];
                case 11:
                    qrBuf = _b.sent();
                    return [4 /*yield*/, pdf.embedPng(qrBuf)];
                case 12:
                    qr = _b.sent();
                    page.drawImage(qr, { x: width - 150, y: 4, width: 26, height: 26 });
                    return [3 /*break*/, 14];
                case 13:
                    e_2 = _b.sent();
                    console.warn('QR code not loaded:', e_2);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/, pdf.save()];
            }
        });
    });
}
// Generate static evaluation PDF for public download
function generateStaticEvaluationPDF() {
    return __awaiter(this, void 0, void 0, function () {
        var pdfBytes, outputPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateEvaluationPDF({ version: '2.2' })];
                case 1:
                    pdfBytes = _a.sent();
                    outputPath = path_1.default.join(process.cwd(), 'public', 'evaluation.pdf');
                    fs_1.default.writeFileSync(outputPath, pdfBytes);
                    console.log('✅ Generated evaluation.pdf successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
// Run if called directly
if (import.meta.url === "file://".concat(process.argv[1])) {
    generateStaticEvaluationPDF();
}
