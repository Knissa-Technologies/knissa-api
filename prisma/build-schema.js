import fs from "node:fs";
import path from "node:path";

const schemaDir = path.join(process.cwd(), "prisma", "schema");
const outputFile = path.join(process.cwd(), "prisma", "schema.prisma");

const files = fs
  .readdirSync(schemaDir)
  .filter(file => file.endsWith(".prisma"))
  .sort();

const header = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

`;

let schema = header;

for (const file of files) {
  const content = fs.readFileSync(
    path.join(schemaDir, file),
    "utf8"
  );

  schema += `

// ======================================================
// ${file}
// ======================================================

`;

  schema += content.trim();
  schema += "\n";
}

fs.writeFileSync(outputFile, schema);

console.log(`✅ schema.prisma generated from ${files.length} modules.`);