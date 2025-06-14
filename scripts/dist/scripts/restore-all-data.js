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
function restoreAllData() {
    return __awaiter(this, void 0, void 0, function () {
        var partsTableSQL, rentalTableSQL, partsCheck, rentalCheck, partsData, _i, partsData_1, part, error, err_1, rentalData, _a, rentalData_1, equipment, error, err_2, partsCount, rentalCount, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 17, , 18]);
                    console.log('🚀 Starting comprehensive data restoration...');
                    console.log('⚠️  This will NOT affect your LMS data (courses, modules, enrollments)');
                    // Create parts table if needed
                    console.log('\n📦 Setting up parts table...');
                    partsTableSQL = "\n      CREATE TABLE IF NOT EXISTS parts (\n        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n        name TEXT NOT NULL,\n        slug TEXT NOT NULL UNIQUE,\n        price DECIMAL(10,2) NOT NULL,\n        price_cents INTEGER DEFAULT 0,\n        category TEXT NOT NULL,\n        brand TEXT NOT NULL,\n        description TEXT NOT NULL,\n        sku TEXT NOT NULL UNIQUE,\n        has_core_charge BOOLEAN DEFAULT FALSE,\n        core_charge DECIMAL(10,2) DEFAULT 0.00,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n      );\n      \n      CREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);\n      CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);\n      CREATE INDEX IF NOT EXISTS parts_sku_idx ON parts(sku);\n    ";
                    // Create rental_equipment table if needed
                    console.log('🏗️  Setting up rental equipment table...');
                    rentalTableSQL = "\n      CREATE TABLE IF NOT EXISTS rental_equipment (\n        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n        name TEXT NOT NULL,\n        slug TEXT NOT NULL UNIQUE,\n        brand TEXT NOT NULL,\n        category TEXT NOT NULL,\n        description TEXT NOT NULL,\n        image_url TEXT,\n        weight_capacity_lbs INTEGER,\n        lift_height_ft INTEGER,\n        power_source TEXT,\n        price_cents INTEGER NOT NULL,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n      );\n      \n      CREATE INDEX IF NOT EXISTS rental_equipment_category_idx ON rental_equipment(category);\n      CREATE INDEX IF NOT EXISTS rental_equipment_brand_idx ON rental_equipment(brand);\n    ";
                    // Execute table creation - NOTE: Must be done manually in Supabase Dashboard
                    console.log('\n⚠️  IMPORTANT: You need to run this SQL in your Supabase Dashboard > SQL Editor:');
                    console.log('==============================================================');
                    console.log(partsTableSQL);
                    console.log('\n-- AND ALSO THIS:');
                    console.log(rentalTableSQL);
                    console.log('==============================================================\n');
                    return [4 /*yield*/, supabase.from('parts').select('*').limit(1)];
                case 1:
                    partsCheck = (_b.sent()).data;
                    return [4 /*yield*/, supabase.from('rental_equipment').select('*').limit(1)];
                case 2:
                    rentalCheck = (_b.sent()).data;
                    if (!partsCheck && !rentalCheck) {
                        console.log('❌ Tables do not exist. Please create them using the SQL above first.');
                        return [2 /*return*/];
                    }
                    // Restore Parts Data (from migrations)
                    console.log('📦 Restoring parts catalog...');
                    partsData = [
                        // Original 13 parts from migrations
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
                        // Golf cart parts from sample data
                        {
                            sku: 'PWEZ36V',
                            name: 'PowerWise 36V EZGO Charger',
                            slug: 'powerwise-36v-ezgo-charger',
                            price: 299.99,
                            price_cents: 29999,
                            category: 'Chargers',
                            brand: 'EZGO',
                            description: 'OEM replacement PowerWise 36V charger for EZGO golf carts',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: 'CC48SOL',
                            name: 'Club Car 48V Solenoid',
                            slug: 'club-car-solenoid-48v',
                            price: 49.95,
                            price_cents: 4995,
                            category: 'Electrical',
                            brand: 'Club Car',
                            description: 'OEM replacement solenoid for 48V Club Car golf carts',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: 'YAM-G29-BELT',
                            name: 'Yamaha Drive/G29 Drive Belt',
                            slug: 'yamaha-g29-drive-belt',
                            price: 89.95,
                            price_cents: 8995,
                            category: 'Drivetrain',
                            brand: 'Yamaha',
                            description: 'Replacement drive belt for Yamaha G29 golf carts',
                            has_core_charge: false,
                            core_charge: 0.00
                        },
                        {
                            sku: 'FORK-48-UNI-001',
                            name: 'Universal Fork Set - 48"',
                            slug: 'universal-fork-set-48',
                            price: 1299.99,
                            price_cents: 129999,
                            category: 'Forks',
                            brand: 'Universal',
                            description: 'Heavy-duty 48" universal fork set for material handling equipment. Features reinforced tines and durable construction for maximum load capacity.',
                            has_core_charge: false,
                            core_charge: 0.00
                        }
                    ];
                    _i = 0, partsData_1 = partsData;
                    _b.label = 3;
                case 3:
                    if (!(_i < partsData_1.length)) return [3 /*break*/, 8];
                    part = partsData_1[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, supabase.from('parts').insert(part)];
                case 5:
                    error = (_b.sent()).error;
                    if (error && !error.message.includes('duplicate key')) {
                        console.error("\u274C Error inserting ".concat(part.sku, ":"), error.message);
                    }
                    else {
                        console.log("\u2705 ".concat(part.sku, " - ").concat(part.name));
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    console.error("\u274C Error with ".concat(part.sku, ":"), err_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    // Restore Rental Equipment Data
                    console.log('\n🚛 Restoring rental equipment...');
                    rentalData = [
                        {
                            name: 'John Deere 320 Skid Steer',
                            slug: 'john-deere-320-skid-steer',
                            brand: 'John Deere',
                            category: 'skid-steer',
                            description: 'Versatile skid steer with 62 hp engine, 1,450 lb rated operating capacity, and excellent maneuverability. Perfect for construction, landscaping, and agricultural tasks.',
                            image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/john-deere-320-skid-steer.jpg',
                            weight_capacity_lbs: 1450,
                            lift_height_ft: 8,
                            power_source: 'Diesel',
                            price_cents: 74900
                        },
                        {
                            name: 'Bobcat S650 Skid Steer',
                            slug: 'bobcat-s650-skid-steer',
                            brand: 'Bobcat',
                            category: 'skid-steer',
                            description: 'High-performance skid steer with 74 hp engine, 2,200 lb rated operating capacity, and advanced control system. Ideal for heavy-duty construction and material handling.',
                            image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/bobcat-s650-skid-steer.jpg',
                            weight_capacity_lbs: 2200,
                            lift_height_ft: 10,
                            power_source: 'Diesel',
                            price_cents: 89900
                        },
                        {
                            name: 'Kubota SVL75-2 Track Loader',
                            slug: 'kubota-svl75-2-track-loader',
                            brand: 'Kubota',
                            category: 'skid-steer',
                            description: 'Track-mounted skid steer with 74 hp engine, 2,200 lb rated operating capacity, and excellent traction. Perfect for soft ground conditions and heavy lifting.',
                            image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/kubota-svl75-2-track-loader.jpg',
                            weight_capacity_lbs: 2200,
                            lift_height_ft: 9,
                            power_source: 'Diesel',
                            price_cents: 99900
                        }
                    ];
                    _a = 0, rentalData_1 = rentalData;
                    _b.label = 9;
                case 9:
                    if (!(_a < rentalData_1.length)) return [3 /*break*/, 14];
                    equipment = rentalData_1[_a];
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, supabase.from('rental_equipment').insert(equipment)];
                case 11:
                    error = (_b.sent()).error;
                    if (error && !error.message.includes('duplicate key')) {
                        console.error("\u274C Error inserting ".concat(equipment.name, ":"), error.message);
                    }
                    else {
                        console.log("\u2705 ".concat(equipment.name));
                    }
                    return [3 /*break*/, 13];
                case 12:
                    err_2 = _b.sent();
                    console.error("\u274C Error with ".concat(equipment.name, ":"), err_2);
                    return [3 /*break*/, 13];
                case 13:
                    _a++;
                    return [3 /*break*/, 9];
                case 14: return [4 /*yield*/, supabase
                        .from('parts')
                        .select('*', { count: 'exact', head: true })];
                case 15:
                    partsCount = (_b.sent()).count;
                    return [4 /*yield*/, supabase
                            .from('rental_equipment')
                            .select('*', { count: 'exact', head: true })];
                case 16:
                    rentalCount = (_b.sent()).count;
                    console.log('\n🎉 Restoration Complete!');
                    console.log("\uD83D\uDCE6 Parts catalog: ".concat(partsCount, " items"));
                    console.log("\uD83D\uDE9B Rental equipment: ".concat(rentalCount, " items"));
                    console.log('🎓 LMS data preserved (courses, modules, enrollments)');
                    console.log('\n💡 Next steps:');
                    console.log('1. Check your parts catalog at /parts');
                    console.log('2. Verify rental equipment listings');
                    console.log('3. Test the learning platform');
                    console.log('4. Set up Stripe pricing if needed');
                    return [3 /*break*/, 18];
                case 17:
                    error_1 = _b.sent();
                    console.error('❌ Restoration failed:', error_1);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
restoreAllData();
