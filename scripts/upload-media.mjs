import fs from "node:fs/promises";
import path from "node:path";
const root=path.resolve(process.argv[2]||"marina-next-export/storage");
const base=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket=process.env.SUPABASE_STORAGE_BUCKET||"marina-media";
if(!base||!key)throw new Error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(full));else out.push(full)}return out}
const files=await walk(root);let ok=0;
for(const file of files){const rel=path.relative(root,file).split(path.sep).join("/");const ext=path.extname(file).toLowerCase();const type=ext===".png"?"image/png":ext===".webp"?"image/webp":ext===".mp4"?"video/mp4":ext===".svg"?"image/svg+xml":"image/jpeg";const res=await fetch(base.replace(/\/$/,"")+"/storage/v1/object/"+bucket+"/"+rel,{method:"POST",headers:{Authorization:"Bearer "+key,apikey:key,"Content-Type":type,"x-upsert":"true"},body:await fs.readFile(file)});if(!res.ok){console.error("Échec",rel,res.status,await res.text());continue}ok++;console.log("Envoyé",rel)}
console.log(ok+"/"+files.length+" média(s) transféré(s).");
