const fs = require("fs");
let content = fs.readFileSync("src/pages/Members.tsx", "utf-8");

const newDivisionsList = `const divisionsList = [
  "All",
  "Core",
  "WITECH ACADEMY",
  "WITECH LAB",
  "WITECH CREATIVE",
  "WITECH CONNECT",
  "WITECH RESEARCH"
];`;

content = content.replace(/const divisionsList = \[[\s\S]*?\];/, newDivisionsList);

const newColorMap = `const divColorMap: Record<string, string> = {
    "Core": "#f59e0b",
    "WITECH ACADEMY": "#ff5e5b",
    "WITECH LAB": "#6366f1",
    "WITECH CREATIVE": "#00cecb",
    "WITECH CONNECT": "#10b981",
    "WITECH RESEARCH": "#8b5cf6"
  };`;

content = content.replace(/const divColorMap: Record<string, string> = \{[\s\S]*?\};/, newColorMap);

content = content.replace(/member\.image \|\| member\.imageUrl/g, 'member.avatar || member.image || member.imageUrl');

fs.writeFileSync("src/pages/Members.tsx", content, "utf-8");
console.log("Members.tsx updated!");
