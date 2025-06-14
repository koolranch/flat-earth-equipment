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
var pdf_lib_1 = require("pdf-lib");
var qrcode_1 = require("qrcode");
function generateEvaluationPDF() {
    return __awaiter(this, void 0, void 0, function () {
        var pdfDoc, page, form, helvetica, helveticaBold, canyonRust, slateGray, lightGray, white, black, _a, width, height, headerHeight, cfrY, formStartY, leftCol, rightCol, fieldHeight, fieldSpacing, createTextField, checklistStartY, checkboxSize, rowHeight, checklistItems, certY, certText, sigY, lineWidth, evaluatorSigField, dateField, footerHeight, footerY, footerText, qrUrl, qrCodeDataUrl, qrCodeImageBytes, qrCodeImage, qrSize, pdfBytes, outputDir, localPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🚀 Starting PDF generation...');
                    return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    pdfDoc = _b.sent();
                    page = pdfDoc.addPage([612, 792]);
                    form = pdfDoc.getForm();
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica)];
                case 2:
                    helvetica = _b.sent();
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold)];
                case 3:
                    helveticaBold = _b.sent();
                    canyonRust = (0, pdf_lib_1.rgb)(0.655, 0.306, 0.133);
                    slateGray = (0, pdf_lib_1.rgb)(0.282, 0.333, 0.408);
                    lightGray = (0, pdf_lib_1.rgb)(0.961, 0.961, 0.961);
                    white = (0, pdf_lib_1.rgb)(1, 1, 1);
                    black = (0, pdf_lib_1.rgb)(0, 0, 0);
                    _a = page.getSize(), width = _a.width, height = _a.height;
                    headerHeight = 43.2;
                    page.drawRectangle({
                        x: 0,
                        y: height - headerHeight,
                        width: width,
                        height: headerHeight,
                        color: canyonRust,
                    });
                    // Header text - "Forklift Operator Practical Evaluation"
                    page.drawText('Forklift Operator Practical Evaluation', {
                        x: width - 350,
                        y: height - 28,
                        size: 18,
                        font: helveticaBold,
                        color: white,
                    });
                    // Logo placeholder (left side)
                    page.drawText('Flat Earth Safety™', {
                        x: 20,
                        y: height - 28,
                        size: 16,
                        font: helveticaBold,
                        color: white,
                    });
                    cfrY = height - headerHeight - 25;
                    page.drawText('29 CFR 1910.178(l) - Powered Industrial Truck Operator Training Requirements', {
                        x: 40,
                        y: cfrY,
                        size: 10,
                        font: helvetica,
                        color: slateGray,
                    });
                    formStartY = cfrY - 40;
                    leftCol = 40;
                    rightCol = 320;
                    fieldHeight = 20;
                    fieldSpacing = 35;
                    createTextField = function (fieldName, x, y, width) {
                        var textField = form.createTextField(fieldName);
                        textField.addToPage(page, {
                            x: x,
                            y: y - 5,
                            width: width,
                            height: fieldHeight,
                            borderWidth: 1,
                            borderColor: black,
                            backgroundColor: white,
                        });
                        textField.setFontSize(11);
                        return textField;
                    };
                    // Left column
                    page.drawText('Operator Name/ID:', {
                        x: leftCol,
                        y: formStartY,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    createTextField('operatorNameId', leftCol + 100, formStartY, 160);
                    page.drawText('Date:', {
                        x: leftCol,
                        y: formStartY - fieldSpacing,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    createTextField('date', leftCol + 100, formStartY - fieldSpacing, 160);
                    // Right column
                    page.drawText('Evaluator Name/Title:', {
                        x: rightCol,
                        y: formStartY,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    createTextField('evaluatorNameTitle', rightCol + 120, formStartY, 160);
                    page.drawText('Equipment Type/ID:', {
                        x: rightCol,
                        y: formStartY - fieldSpacing,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    createTextField('equipmentTypeId', rightCol + 120, formStartY - fieldSpacing, 160);
                    checklistStartY = formStartY - 100;
                    checkboxSize = 14;
                    rowHeight = 28;
                    checklistItems = [
                        'Pre-Operation Inspection: Fluid levels, tires, forks, mast, safety devices',
                        'Personal Safety: Seatbelt usage and proper mounting/dismounting (3-point)',
                        'Operating Speed: Travel speed 5 mph or less, appropriate for conditions',
                        'Pedestrian Safety: Horn use at intersections, awareness of surroundings',
                        'Load Handling: Proper tilt back, smooth control, load capacity adherence'
                    ];
                    page.drawText('Mark "YES" only when operator demonstrates each action safely and unaided:', {
                        x: leftCol,
                        y: checklistStartY + 20,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    // Draw checklist items with interactive checkboxes
                    checklistItems.forEach(function (item, index) {
                        var y = checklistStartY - (index * rowHeight);
                        // Create interactive checkbox
                        var checkbox = form.createCheckBox("checklist_".concat(index));
                        checkbox.addToPage(page, {
                            x: leftCol,
                            y: y - checkboxSize / 2,
                            width: checkboxSize,
                            height: checkboxSize,
                            borderWidth: 1,
                            borderColor: black,
                            backgroundColor: lightGray,
                        });
                        // Item text
                        page.drawText(item, {
                            x: leftCol + 25,
                            y: y - 4,
                            size: 11,
                            font: helvetica,
                            color: black,
                            maxWidth: 480,
                        });
                    });
                    certY = checklistStartY - (checklistItems.length * rowHeight) - 40;
                    page.drawText('CERTIFICATION STATEMENT', {
                        x: leftCol,
                        y: certY,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                    });
                    certText = 'I certify that the above practical skills were evaluated in accordance with 29 CFR 1910.178(l)(6). ' +
                        'The operator has demonstrated competency in all required areas.';
                    page.drawText(certText, {
                        x: leftCol,
                        y: certY - 20,
                        size: 11,
                        font: helveticaBold,
                        color: black,
                        maxWidth: 500,
                        lineHeight: 16,
                    });
                    page.drawText('Note: Any "No" or failed demonstration requires remediation and complete retest.', {
                        x: leftCol,
                        y: certY - 55,
                        size: 10,
                        font: helvetica,
                        color: slateGray,
                        maxWidth: 500,
                    });
                    sigY = certY - 90;
                    lineWidth = 252;
                    evaluatorSigField = form.createTextField('evaluatorSignature');
                    evaluatorSigField.addToPage(page, {
                        x: leftCol,
                        y: sigY - 15,
                        width: lineWidth,
                        height: 30,
                        borderWidth: 1,
                        borderColor: black,
                        backgroundColor: white,
                    });
                    evaluatorSigField.setFontSize(12);
                    page.drawText('Evaluator Signature', {
                        x: leftCol,
                        y: sigY - 35,
                        size: 9,
                        font: helvetica,
                        color: black,
                    });
                    dateField = form.createTextField('signatureDate');
                    dateField.addToPage(page, {
                        x: rightCol + 50,
                        y: sigY - 15,
                        width: 130,
                        height: 30,
                        borderWidth: 1,
                        borderColor: black,
                        backgroundColor: white,
                    });
                    dateField.setFontSize(12);
                    page.drawText('Date', {
                        x: rightCol + 50,
                        y: sigY - 35,
                        size: 9,
                        font: helvetica,
                        color: black,
                    });
                    footerHeight = 28.8;
                    footerY = 50;
                    // Footer rule
                    page.drawLine({
                        start: { x: 40, y: footerY + footerHeight },
                        end: { x: width - 40, y: footerY + footerHeight },
                        thickness: 2,
                        color: canyonRust,
                    });
                    footerText = 'Flat Earth Safety™ · Built Western Tough · Form v2.3 | Retain for 3 years\nflatearthequipment.com | contact@flatearthequipment.com | (307) 302-0043';
                    page.drawText(footerText, {
                        x: 40,
                        y: footerY + 5,
                        size: 8,
                        font: helvetica,
                        color: black,
                        lineHeight: 10,
                        maxWidth: width - 140, // Leave space for QR code
                    });
                    // GENERATE QR CODE
                    console.log('📱 Generating QR code...');
                    qrUrl = 'https://flatearthequipment.com/safety/records';
                    return [4 /*yield*/, qrcode_1.default.toDataURL(qrUrl, {
                            width: 54, // 0.75 inches at 72 DPI
                            margin: 0,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })];
                case 4:
                    qrCodeDataUrl = _b.sent();
                    qrCodeImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
                    return [4 /*yield*/, pdfDoc.embedPng(qrCodeImageBytes)];
                case 5:
                    qrCodeImage = _b.sent();
                    qrSize = 54;
                    page.drawImage(qrCodeImage, {
                        x: width - 60 - qrSize,
                        y: footerY,
                        width: qrSize,
                        height: qrSize,
                    });
                    // Save the PDF
                    console.log('💾 Saving PDF...');
                    return [4 /*yield*/, pdfDoc.save()];
                case 6:
                    pdfBytes = _b.sent();
                    outputDir = path_1.default.join(process.cwd(), 'public', 'pdfs');
                    if (!fs_1.default.existsSync(outputDir)) {
                        fs_1.default.mkdirSync(outputDir, { recursive: true });
                    }
                    localPath = path_1.default.join(outputDir, 'forklift-eval-v2.3.pdf');
                    fs_1.default.writeFileSync(localPath, pdfBytes);
                    console.log('✅ PDF generated locally at:', localPath);
                    console.log('📁 File size:', (pdfBytes.length / 1024).toFixed(1), 'KB');
                    return [2 /*return*/, localPath];
            }
        });
    });
}
// Run the script
generateEvaluationPDF().catch(console.error);
