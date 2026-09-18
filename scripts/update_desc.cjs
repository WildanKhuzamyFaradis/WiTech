const fs = require("fs");
let content = fs.readFileSync("src/lib/data.ts", "utf-8");

const newDivisions = `export const divisions: Division[] = [
  {
    id: "academy",
    name: "WiTECH Academy",
    shortName: "Academy",
    description: "Pusatnya upgrade diri! Fokus ningkatin kompetensi member lewat kelas seru, workshop, dan mentoring. Nggak cuma skill teknis, soft skill kamu juga bakal diasah dari nol biar makin siap terjun ke dunia profesional.",
    icon: "Smartphone",
    memberCount: 4,
    color: "#ff5e5b",
    technologies: ["Mentoring", "Workshop", "Soft Skill", "Hard Skill"],
  },
  {
    id: "lab",
    name: "WiTECH Lab",
    shortName: "Lab",
    description: "Dapur inovasinya Witech! Wadah buat ngembangin ide gila kamu jadi karya dan solusi teknologi beneran. Kita garap berbagai proyek kolaborasi seru yang pastinya bermanfaat buat kampus dan masyarakat sekitar.",
    icon: "Code",
    memberCount: 4,
    color: "#6366f1",
    technologies: ["Kolaborasi", "Inovasi", "Problem Solving", "Pengembangan Ide"],
  },
  {
    id: "creative",
    name: "WiTECH Creative",
    shortName: "Creative",
    description: "Otak di balik visual kece organisasi! Kita yang kelola identitas visual, media digital, dan bikin konten kreatif. Mulai dari ngedesain poster, ngedit video, sampai ngebangun branding organisasi yang inovatif.",
    icon: "Palette",
    memberCount: 5,
    color: "#00cecb",
    technologies: ["Visual Design", "Multimedia", "Branding", "Content Creator"],
  },
  {
    id: "connect",
    name: "WiTECH Connect",
    shortName: "Connect",
    description: "Jembatan relasi kita! Kerjanya cari teman, bangun kolaborasi, dan kemitraan sama organisasi, industri, sampai masyarakat. Seru-seruan bikin event keren dan nambah koneksi luas berawal dari divisi ini.",
    icon: "Shield",
    memberCount: 5,
    color: "#10b981",
    technologies: ["Public Relations", "Event Organizing", "Networking", "Kemitraan"],
  },
  {
    id: "research",
    name: "WiTECH Research",
    shortName: "Research",
    description: "Tim pemikir yang suka ngulik data! Kita fokus ke penelitian, analisis data, dan inovasi. Hasil riset dan publikasi ilmiah kita bakal dipake sebagai kontribusi nyata teknologi untuk nyelesaiin masalah sehari-hari.",
    icon: "Brain",
    memberCount: 5,
    color: "#8b5cf6",
    technologies: ["Riset Ilmiah", "Analisis Data", "Publikasi", "Inovasi Teknologi"],
  },
];`;

content = content.replace(/export const divisions: Division\[\] = \[[\s\S]*?\];/, newDivisions);

content = content.replace(/WITECH ACADEMY/g, "WiTECH Academy");
content = content.replace(/WITECH LAB/g, "WiTECH Lab");
content = content.replace(/WITECH CREATIVE/g, "WiTECH Creative");
content = content.replace(/WITECH CONNECT/g, "WiTECH Connect");
content = content.replace(/WITECH RESEARCH/g, "WiTECH Research");

fs.writeFileSync("src/lib/data.ts", content, "utf-8");

let membersContent = fs.readFileSync("src/pages/Members.tsx", "utf-8");
membersContent = membersContent.replace(/WITECH ACADEMY/g, "WiTECH Academy");
membersContent = membersContent.replace(/WITECH LAB/g, "WiTECH Lab");
membersContent = membersContent.replace(/WITECH CREATIVE/g, "WiTECH Creative");
membersContent = membersContent.replace(/WITECH CONNECT/g, "WiTECH Connect");
membersContent = membersContent.replace(/WITECH RESEARCH/g, "WiTECH Research");
fs.writeFileSync("src/pages/Members.tsx", membersContent, "utf-8");

console.log("Descriptions updated!");
