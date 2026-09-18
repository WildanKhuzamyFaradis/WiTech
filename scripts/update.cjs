const fs = require("fs");

const content = fs.readFileSync("src/lib/data.ts", "utf-8");

const newDivisions = `export const divisions: Division[] = [
  {
    id: "academy",
    name: "WITECH ACADEMY",
    shortName: "Academy",
    description: "Belajar dasar teknologi sehari-hari: Word, Excel, PowerPoint, Google Workspace, manajemen file, troubleshooting laptop & HP. Cocok banget buat yang baru mulai.",
    icon: "Smartphone",
    memberCount: 4,
    color: "#ff5e5b",
    technologies: ["Microsoft Office", "Google Workspace", "Canva", "Troubleshooting"],
  },
  {
    id: "lab",
    name: "WITECH LAB",
    shortName: "Lab",
    description: "Bikin website, aplikasi, dan belajar hardware. Dari HTML dasar sampai framework modern, Arduino, dan IoT.",
    icon: "Code",
    memberCount: 4,
    color: "#6366f1",
    technologies: ["React", "Next.js", "Arduino", "IoT"],
  },
  {
    id: "creative",
    name: "WITECH CREATIVE",
    shortName: "Creative",
    description: "Desain grafis, video editing, UI/UX, fotografi digital. Dari bikin poster event sampai desain website.",
    icon: "Palette",
    memberCount: 5,
    color: "#00cecb",
    technologies: ["Figma", "Canva", "CapCut", "Photoshop"],
  },
  {
    id: "connect",
    name: "WITECH CONNECT",
    shortName: "Connect",
    description: "Humas, networking, manajemen sosial media, dan event organizing. Membangun relasi dan memperluas jaringan Witech.",
    icon: "Shield",
    memberCount: 5,
    color: "#10b981",
    technologies: ["Public Speaking", "Event Management", "Networking", "Social Media"],
  },
  {
    id: "research",
    name: "WITECH RESEARCH",
    shortName: "Research",
    description: "Riset teknologi terbaru, analisis data, machine learning, dan AI. Dari pencarian informasi hingga pengolahan data.",
    icon: "Brain",
    memberCount: 5,
    color: "#8b5cf6",
    technologies: ["Python", "Data Analysis", "Research", "AI"],
  },
];`;

const newMembers = `export const members: Member[] = [
  // Core
  { id: "1", name: "IDDRUS, M.Kom", role: "Pembina", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=IDDRUS", github: "", linkedin: "", active: true },
  { id: "2", name: "Sulfa eka safira", role: "Ketua", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sulfa", github: "", linkedin: "", active: true },
  { id: "3", name: "Gibran aljilani", role: "Wakil Ketua", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gibran", github: "", linkedin: "", active: true },
  { id: "4", name: "Zhubdatul fadhilah", role: "Sekretaris", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhubdatul", github: "", linkedin: "", active: true },
  { id: "5", name: "Oktari fitriani anwar", role: "Wakil Sekretaris", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oktari", github: "", linkedin: "", active: true },
  { id: "6", name: "Rumsil lailiyatun nuraini", role: "Bendahara", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rumsil", github: "", linkedin: "", active: true },
  { id: "7", name: "Nurul intan aulia H", role: "Wakil Bendahara", division: "Core", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul", github: "", linkedin: "", active: true },
  
  // WITECH ACADEMY
  { id: "8", name: "Muhammad Jasuli", role: "Ketua Divisi", division: "WITECH ACADEMY", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasuli", github: "", linkedin: "", active: true },
  { id: "9", name: "Ach. Faiz mahmudi", role: "Anggota", division: "WITECH ACADEMY", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Faiz", github: "", linkedin: "", active: true },
  { id: "10", name: "Dina Safitri", role: "Anggota", division: "WITECH ACADEMY", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dina", github: "", linkedin: "", active: true },
  { id: "11", name: "Lailatul Hasanah", role: "Anggota", division: "WITECH ACADEMY", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lailatul", github: "", linkedin: "", active: true },

  // WITECH LAB
  { id: "12", name: "Wildan khuzamy faradis", role: "Ketua Divisi", division: "WITECH LAB", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wildan", github: "", linkedin: "", active: true },
  { id: "13", name: "Nofan nelandi R", role: "Anggota", division: "WITECH LAB", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nofan", github: "", linkedin: "", active: true },
  { id: "14", name: "Nur Hartatik", role: "Anggota", division: "WITECH LAB", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hartatik", github: "", linkedin: "", active: true },
  { id: "15", name: "Wafika Jamila hadi", role: "Anggota", division: "WITECH LAB", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wafika", github: "", linkedin: "", active: true },

  // WITECH CREATIVE
  { id: "16", name: "Mukhlishatul afifah", role: "Ketua Divisi", division: "WITECH CREATIVE", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mukhlishatul", github: "", linkedin: "", active: true },
  { id: "17", name: "Moh Hazmi Farhadinoto", role: "Anggota", division: "WITECH CREATIVE", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hazmi", github: "", linkedin: "", active: true },
  { id: "18", name: "Irfan Haryanto", role: "Anggota", division: "WITECH CREATIVE", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Irfan", github: "", linkedin: "", active: true },
  { id: "19", name: "Zian ayu fitri R", role: "Anggota", division: "WITECH CREATIVE", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zian", github: "", linkedin: "", active: true },
  { id: "20", name: "Alya faradiana", role: "Anggota", division: "WITECH CREATIVE", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alya", github: "", linkedin: "", active: true },

  // WITECH CONNECT
  { id: "21", name: "Trio lestari rais sobri", role: "Ketua Divisi", division: "WITECH CONNECT", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Trio", github: "", linkedin: "", active: true },
  { id: "22", name: "Moh Jufri", role: "Anggota", division: "WITECH CONNECT", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jufri", github: "", linkedin: "", active: true },
  { id: "23", name: "Liana Intan Prastika", role: "Anggota", division: "WITECH CONNECT", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liana", github: "", linkedin: "", active: true },
  { id: "24", name: "Dzul kifli", role: "Anggota", division: "WITECH CONNECT", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dzul", github: "", linkedin: "", active: true },
  { id: "25", name: "Robitul auliya' alfayedz", role: "Anggota", division: "WITECH CONNECT", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robitul", github: "", linkedin: "", active: true },

  // WITECH RESEARCH
  { id: "26", name: "Adelia mahardika puteri", role: "Ketua Divisi", division: "WITECH RESEARCH", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adelia", github: "", linkedin: "", active: true },
  { id: "27", name: "Dewa putra kusuma", role: "Anggota", division: "WITECH RESEARCH", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dewa", github: "", linkedin: "", active: true },
  { id: "28", name: "Utami Tri Hapsari", role: "Anggota", division: "WITECH RESEARCH", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Utami", github: "", linkedin: "", active: true },
  { id: "29", name: "Ach Fikri Maulana Putra", role: "Anggota", division: "WITECH RESEARCH", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fikri", github: "", linkedin: "", active: true },
  { id: "30", name: "Balwanindyta Akrida Putri", role: "Anggota", division: "WITECH RESEARCH", year: "2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Balwanindyta", github: "", linkedin: "", active: true },
];`;

let newContent = content.replace(/export const divisions: Division\[\] = \[[\s\S]*?\];/m, newDivisions);
newContent = newContent.replace(/export const members: Member\[\] = \[[\s\S]*?\];/m, newMembers);

newContent = newContent.replace(/"divisionId": "digilit"/g, '"divisionId": "academy"');
newContent = newContent.replace(/"divisionId": "webapp"/g, '"divisionId": "lab"');
newContent = newContent.replace(/"divisionId": "cybernet"/g, '"divisionId": "lab"');
newContent = newContent.replace(/"divisionId": "hardware"/g, '"divisionId": "lab"');
newContent = newContent.replace(/"divisionId": "dataai"/g, '"divisionId": "research"');

newContent = newContent.replace(/"division": "Digital Literacy"/g, '"division": "WITECH ACADEMY"');
newContent = newContent.replace(/"division": "Web & App Development"/g, '"division": "WITECH LAB"');
newContent = newContent.replace(/"division": "Cybersecurity & Networking"/g, '"division": "WITECH LAB"');
newContent = newContent.replace(/"division": "Hardware & IoT"/g, '"division": "WITECH LAB"');
newContent = newContent.replace(/"division": "Creative & Design"/g, '"division": "WITECH CREATIVE"');
newContent = newContent.replace(/"division": "Data & AI"/g, '"division": "WITECH RESEARCH"');

fs.writeFileSync("src/lib/data.ts", newContent, "utf-8");
console.log("Updated data.ts!");
