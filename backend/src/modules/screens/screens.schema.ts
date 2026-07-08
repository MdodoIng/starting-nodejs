import { z } from "zod";

export const createScreenSchema = z.object({
  name: z.string().min(1).max(100),
  rows: z.number().int().min(1).max(26), // capped at 26 to keep row_label as a single letter A-Z
  columns: z.number().int().min(1).max(50),
});
