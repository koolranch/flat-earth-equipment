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
function restorePartsTable() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, existing, checkError, partsData, _i, partsData_1, part, insertError, _b, count, countError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    console.log('🔧 Restoring parts table and data...');
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .select('*')
                            .limit(1)];
                case 1:
                    _a = _c.sent(), existing = _a.data, checkError = _a.error;
                    if (!checkError) {
                        console.log('⚠️  Parts table already exists. Skipping table creation.');
                    }
                    else {
                        console.log('📋 Parts table does not exist, need to run migration manually.');
                        console.log('Please run this SQL in your Supabase Dashboard > SQL Editor:');
                        console.log("\n-- Create parts table\nCREATE TABLE IF NOT EXISTS parts (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  slug TEXT NOT NULL UNIQUE,\n  price DECIMAL(10,2) NOT NULL,\n  price_cents INTEGER DEFAULT 0,\n  category TEXT NOT NULL,\n  brand TEXT NOT NULL,\n  description TEXT NOT NULL,\n  sku TEXT NOT NULL UNIQUE,\n  has_core_charge BOOLEAN DEFAULT FALSE,\n  core_charge DECIMAL(10,2) DEFAULT 0.00,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Create indexes\nCREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);\nCREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);\nCREATE INDEX IF NOT EXISTS parts_sku_idx ON parts(sku);\n\n-- Create updated_at trigger\nCREATE OR REPLACE FUNCTION update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n    NEW.updated_at = CURRENT_TIMESTAMP;\n    RETURN NEW;\nEND;\n$$ language 'plpgsql';\n\nCREATE OR REPLACE TRIGGER update_parts_updated_at\n    BEFORE UPDATE ON parts\n    FOR EACH ROW\n    EXECUTE FUNCTION update_updated_at_column();\n      ");
                        return [2 /*return*/];
                    }
                    // Insert the known parts data from migrations
                    console.log('📦 Inserting parts data...');
                    partsData = [
                        {
                            sku: '91A1431010',
                            name: 'Curtis Controller',
                            slug: 'curtis-controller-91A1431010',
                            price: 898.00,
                            price_cents: 89800,
                            category: 'Controllers',
                            brand: 'Curtis',
                            description: 'Curtis motor controller',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: '1600292',
                            name: 'Transmission Assembly',
                            slug: 'transmission-assembly-1600292',
                            price: 2400.00,
                            price_cents: 240000,
                            category: 'Transmissions',
                            brand: 'Dana',
                            description: 'Complete transmission assembly',
                            has_core_charge: true,
                            core_charge: 800.00
                        },
                        {
                            sku: '7930220',
                            name: 'Hydraulic Pump',
                            slug: 'hydraulic-pump-7930220',
                            price: 500.00,
                            price_cents: 50000,
                            category: 'Hydraulics',
                            brand: 'Parker',
                            description: 'Hydraulic pump assembly',
                            has_core_charge: true,
                            core_charge: 200.00
                        },
                        {
                            sku: '105739',
                            name: 'Starter Motor',
                            slug: 'starter-motor-105739',
                            price: 340.00,
                            price_cents: 34000,
                            category: 'Electrical',
                            brand: 'Bosch',
                            description: 'Electric starter motor',
                            has_core_charge: true,
                            core_charge: 200.00
                        },
                        {
                            sku: '53720-U224171',
                            name: 'Mast Assembly',
                            slug: 'mast-assembly-53720-U224171',
                            price: 750.00,
                            price_cents: 75000,
                            category: 'Masts',
                            brand: 'Toyota',
                            description: 'Forklift mast assembly',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: '53730-U116271',
                            name: 'Hydraulic Cylinder',
                            slug: 'hydraulic-cylinder-53730-U116271',
                            price: 850.00,
                            price_cents: 85000,
                            category: 'Hydraulics',
                            brand: 'Toyota',
                            description: 'Hydraulic lift cylinder',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: '53730-U117071',
                            name: 'Lift Cylinder',
                            slug: 'lift-cylinder-53730-U117071',
                            price: 520.00,
                            price_cents: 52000,
                            category: 'Hydraulics',
                            brand: 'Toyota',
                            description: 'Forklift lift cylinder',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: '62-400-05',
                            name: 'Engine Block',
                            slug: 'engine-block-62-400-05',
                            price: 1300.00,
                            price_cents: 130000,
                            category: 'Engines',
                            brand: 'Kubota',
                            description: 'Complete engine block assembly',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: '4092995',
                            name: 'Water Pump',
                            slug: 'water-pump-4092995',
                            price: 550.00,
                            price_cents: 55000,
                            category: 'Cooling',
                            brand: 'Cummins',
                            description: 'Engine water pump',
                            has_core_charge: true,
                            core_charge: 200.00
                        },
                        {
                            sku: '7930220-TD',
                            name: 'Hydraulic Pump TD',
                            slug: 'hydraulic-pump-td-7930220-TD',
                            price: 350.00,
                            price_cents: 35000,
                            category: 'Hydraulics',
                            brand: 'Parker',
                            description: 'Hydraulic pump TD model',
                            has_core_charge: true,
                            core_charge: 200.00
                        },
                        {
                            sku: '148319-001',
                            name: 'Differential Assembly',
                            slug: 'differential-assembly-148319-001',
                            price: 1100.00,
                            price_cents: 110000,
                            category: 'Drivetrain',
                            brand: 'Dana',
                            description: 'Rear differential assembly',
                            has_core_charge: true,
                            core_charge: 550.00
                        },
                        {
                            sku: '142517',
                            name: 'Brake Assembly',
                            slug: 'brake-assembly-142517',
                            price: 650.00,
                            price_cents: 65000,
                            category: 'Brakes',
                            brand: 'Bendix',
                            description: 'Complete brake assembly',
                            has_core_charge: true,
                            core_charge: 400.00
                        },
                        {
                            sku: '144583',
                            name: 'Wheel Hub',
                            slug: 'wheel-hub-144583',
                            price: 925.00,
                            price_cents: 92500,
                            category: 'Wheels',
                            brand: 'Timken',
                            description: 'Front wheel hub assembly',
                            has_core_charge: true,
                            core_charge: 400.00
                        }
                    ];
                    _i = 0, partsData_1 = partsData;
                    _c.label = 2;
                case 2:
                    if (!(_i < partsData_1.length)) return [3 /*break*/, 5];
                    part = partsData_1[_i];
                    return [4 /*yield*/, supabase
                            .from('parts')
                            .insert(part)];
                case 3:
                    insertError = (_c.sent()).error;
                    if (insertError) {
                        console.error("\u274C Error inserting ".concat(part.sku, ":"), insertError);
                    }
                    else {
                        console.log("\u2705 Inserted ".concat(part.sku, " - ").concat(part.name));
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, supabase
                        .from('parts')
                        .select('*', { count: 'exact', head: true })];
                case 6:
                    _b = _c.sent(), count = _b.count, countError = _b.error;
                    if (countError) {
                        console.error('❌ Error counting parts:', countError);
                    }
                    else {
                        console.log("\uD83C\uDF89 Parts table restored with ".concat(count, " items"));
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error('Script error:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
restorePartsTable();
