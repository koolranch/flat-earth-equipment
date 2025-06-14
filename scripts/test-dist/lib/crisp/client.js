"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crisp = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
var Crisp = require("crisp-api");
var crisp = new Crisp();
exports.crisp = crisp;
crisp.authenticate(process.env.CRISP_WEBSITE_ID, process.env.CRISP_API_KEY);
