import { readFileSync } from 'fs';

const raw = readFileSync('.env', 'utf8');
const line = raw.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
if (!line) {
  console.log('CHECK: DATABASE_URL missing');
  process.exit(1);
}
const val = line.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
console.log('CHECK: DATABASE_URL present:', Boolean(val));
console.log('CHECK: postgresql + supabase:', val.startsWith('postgresql://') && val.includes('supabase'));
console.log(
  'CHECK: placeholder not replaced:',
  /\[YOUR-PASSWORD\]|\[password\]/i.test(val),
);
console.log('CHECK: length (chars):', val.length);
