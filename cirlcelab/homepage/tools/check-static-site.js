const fs = require("node:fs");
const path = require("node:path");

const rootDir = process.cwd();
const htmlFiles = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
  .map((entry) => entry.name)
  .sort();
const cssFiles = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".css"))
  .map((entry) => entry.name)
  .sort();

const skipPattern =
  /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:|javascript:)/i;

const stripQuery = (value) => value.split("#")[0].split("?")[0];

const referenceMap = new Map();

const collectReference = (sourceFile, rawReference) => {
  if (!rawReference || skipPattern.test(rawReference)) {
    return;
  }

  const normalizedReference = stripQuery(rawReference.trim());
  if (!normalizedReference) {
    return;
  }

  const resolvedPath = path.resolve(path.dirname(sourceFile), normalizedReference);
  const relativeSource = path.relative(rootDir, sourceFile) || path.basename(sourceFile);

  if (!referenceMap.has(resolvedPath)) {
    referenceMap.set(resolvedPath, []);
  }

  referenceMap.get(resolvedPath).push({
    reference: normalizedReference,
    source: relativeSource,
  });
};

const htmlAttributePattern = /\b(?:src|href)=["']([^"']+)["']/gi;
const cssUrlPattern = /url\((['"]?)([^'")]+)\1\)/gi;

for (const fileName of htmlFiles) {
  const fullPath = path.join(rootDir, fileName);
  const content = fs.readFileSync(fullPath, "utf8");

  for (const match of content.matchAll(htmlAttributePattern)) {
    collectReference(fullPath, match[1]);
  }
}

for (const fileName of cssFiles) {
  const fullPath = path.join(rootDir, fileName);
  const content = fs.readFileSync(fullPath, "utf8");

  for (const match of content.matchAll(cssUrlPattern)) {
    collectReference(fullPath, match[2]);
  }
}

const missing = [];
let checked = 0;

for (const [resolvedPath, sources] of referenceMap.entries()) {
  checked += 1;
  if (!fs.existsSync(resolvedPath)) {
    missing.push({
      path: path.relative(rootDir, resolvedPath),
      sources,
    });
  }
}

if (htmlFiles.length === 0) {
  console.error("No HTML files found in the project root.");
  process.exit(1);
}

if (missing.length > 0) {
  console.error(`Checked ${checked} local references. Missing ${missing.length}:`);
  for (const entry of missing) {
    const usedBy = entry.sources
      .map((source) => `${source.source} -> ${source.reference}`)
      .join(", ");
    console.error(`- ${entry.path} (${usedBy})`);
  }
  process.exit(1);
}

console.log(
  `Static check passed. Verified ${checked} local references across ${htmlFiles.length} HTML file(s) and ${cssFiles.length} CSS file(s).`
);
