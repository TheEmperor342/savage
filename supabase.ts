import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseKey = process.env["SUPABASE_KEY"];

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function getText(item: string): Promise<string | null> {
  item = `${item}.svg`;

  const ls = await supabase.storage.from("logos").list();
  const images: string[] = [];
  if (ls.error) {
    console.log(ls.error);
    return null;
  }

  ls.data?.forEach((item, index) => {
    images.push(item.name);
  });
  if (!images.includes(item)) return null;

  const dwnload = await supabase.storage.from("logos").download(item);
  if (dwnload.error) {
    console.log(dwnload.error);
    return null;
  }

  return dwnload.data?.text() === undefined ? null : dwnload.data?.text();
}
