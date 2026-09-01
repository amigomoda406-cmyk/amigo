const geo = require('geoalgeria');
const fs = require('fs');

const wilayaCommunes = {};

geo.communes.forEach(c => {
  const wilayaCode = String(c.wilaya_code).padStart(2, '0');
  if (!wilayaCommunes[wilayaCode]) wilayaCommunes[wilayaCode] = [];
  // Use name_fr which is always a proper string
  const name = c.name_fr;
  if (name && typeof name === 'string' && name.trim()) {
    wilayaCommunes[wilayaCode].push(name.trim());
  }
});

let tsCode = `// Generated from geoalgeria\nexport const COMMUNES_BY_WILAYA: Record<string, string[]> = {\n`;
for (const [code, list] of Object.entries(wilayaCommunes)) {
  tsCode += `  '${code}': ${JSON.stringify(list.sort())},\n`;
}
tsCode += `};\n`;

fs.writeFileSync('src/lib/config/communes.ts', tsCode);
console.log('Successfully generated src/lib/config/communes.ts');
