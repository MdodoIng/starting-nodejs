"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScreenSchema = void 0;
const zod_1 = require("zod");
exports.createScreenSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    rows: zod_1.z.number().int().min(1).max(26), // capped at 26 to keep row_label as a single letter A-Z
    columns: zod_1.z.number().int().min(1).max(50),
});
