import fs from "node:fs";

const legalPages = [
  "privacy.html",
  "terms.html",
  "ai-compliance.html",
  "recording-notice.html",
  "sms-terms.html",
];
const requiredNavLinks = [
  "./privacy.html",
  "./terms.html",
  "./ai-compliance.html",
  "./recording-notice.html",
  "./sms-terms.html",
];
const errors = [];
for (const file of legalPages) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required legal page: ${file}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes('href="./legal.css"')) errors.push(`${file}: missing shared legal.css`);
  if (!html.includes('class="legal-nav"')) errors.push(`${file}: missing shared legal navigation`);
  if (!html.includes('class="legal-footer"')) errors.push(`${file}: missing consistent legal footer`);
  if (!/Effective\s+[A-Z][a-z]+\s+\d{1,2},\s+\d{4}/i.test(html)) errors.push(`${file}: missing or unrecognized effective date`);
  for (const link of requiredNavLinks) {
    if (!html.includes(`href="${link}"`)) errors.push(`${file}: missing legal cross-link ${link}`);
  }
}
if (!fs.existsSync("legal.css")) {
  errors.push("Missing legal.css");
} else {
  const css = fs.readFileSync("legal.css", "utf8");
  for (const token of [
    "--legal-bg: #0b141c",
    "--legal-text: #f1f6f4",
    "--legal-muted: #c3d0d2",
    "background: var(--legal-bg) !important",
    "font-size: 16px !important",
    ":focus-visible",
    "@media (max-width: 600px)",
  ]) {
    if (!css.includes(token)) errors.push(`legal.css: required readability rule missing: ${token}`);
  }
}
if (errors.length) {
  console.error("Legal readability checks failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Passed: ${legalPages.length} legal pages use the shared readable layout, navigation, effective dates and cross-links.`);
