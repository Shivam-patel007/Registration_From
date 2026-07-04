import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});
import { createClient } from "@supabase/supabase-js/dist/index.cjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Secure key

export const supabase = createClient(supabaseUrl, supabaseKey);
