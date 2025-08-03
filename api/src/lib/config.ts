import z from "zod";
import dotenv from "dotenv";
dotenv.config();

const configSchema = z.object({
  PORT: z
    .string()
    .max(4, { message: "PORT must be at most 4 characters" })
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 8000;
      },
      { message: "PORT must be a number between 0 and 8000" }
    ),
  ALLOW_ORIGIN: z.string(),
  MONGODB_ATLAS_URI: z.string(),
  MONGODB_ATLAS_DB: z.string(),
  MONGODB_ATLAS_COLLECTION: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_ENDPOINT: z.string(),
});

export type IConfig = z.infer<typeof configSchema>;

export const config = configSchema.parse(process.env);
