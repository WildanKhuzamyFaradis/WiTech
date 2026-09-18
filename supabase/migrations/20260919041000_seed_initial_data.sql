-- Seed the initial WiTECH dataset from the current frontend fixture source at
-- frontend/src/lib/data.ts. This file intentionally preserves all existing IDs,
-- text, URLs, and ordering values currently used by the public app.

BEGIN;

INSERT INTO public.divisions (
  id,
  name,
  short_name,
  description,
  icon,
  color,
  technologies,
  sort_order
) VALUES
  (
    'academy',
    'WiTECH Academy',
    'Academy',
    'Pusat pengembangan diri di WiTech. Divisi ini menyelenggarakan kelas, workshop, dan mentoring untuk meningkatkan kompetensi teknis sekaligus soft skill, mulai dari dasar hingga siap menghadapi tantangan dunia profesional.',
    'Smartphone',
    '#ff5e5b',
    ARRAY['Mentoring', 'Workshop', 'Soft Skill', 'Hard Skill'],
    0
  ),
  (
    'lab',
    'WiTECH Lab',
    'Lab',
    'Tempat ide berkembang menjadi karya nyata. Divisi ini menangani proyek kolaboratif, pengembangan solusi, dan eksperimen teknologi yang bermanfaat bagi kampus dan masyarakat sekitar.',
    'Code',
    '#6366f1',
    ARRAY['Kolaborasi', 'Inovasi', 'Problem Solving', 'Pengembangan Ide'],
    1
  ),
  (
    'creative',
    'WiTECH Creative',
    'Creative',
    'Mengelola visual dan komunikasi digital WiTech. Divisi ini bertanggung jawab pada identitas visual, desain grafis, konten kreatif, dan kebutuhan publikasi organisasi.',
    'Palette',
    '#00cecb',
    ARRAY['Visual Design', 'Multimedia', 'Branding', 'Content Creator'],
    2
  ),
  (
    'connect',
    'WiTECH Connect',
    'Connect',
    'Menjaga hubungan WiTech dengan komunitas, mitra, dan audiens. Divisi ini mendukung event, kolaborasi, serta penguatan jaringan agar organisasi dapat tumbuh dan terhubung dengan lebih luas.',
    'Shield',
    '#10b981',
    ARRAY['Public Relations', 'Event Organizing', 'Networking', 'Kemitraan'],
    3
  ),
  (
    'research',
    'WiTECH Research',
    'Research',
    'Mendalami riset, analisis data, dan solusi berbasis kebutuhan nyata. Divisi ini mendorong pendekatan berbasis data serta pengembangan inovasi yang relevan dengan persoalan sehari-hari.',
    'Brain',
    '#8b5cf6',
    ARRAY['Riset Ilmiah', 'Analisis Data', 'Publikasi', 'Inovasi Teknologi'],
    4
  )

INSERT INTO public.projects (
  id,
  slug,
  title,
  subtitle,
  description,
  division_id,
  tags,
  year,
  status,
  featured,
  image,
  members,
  award,
  github_url,
  live_url,
  sort_order
) VALUES
  (
    '1',
    'wilearn-platform',
    'WiLearn',
    'Platform E-Learning Kampus',
    'Platform e-learning kampus yang digunakan untuk kelas online, pengelolaan materi, dan pelacakan progres peserta dengan dukungan fitur berbasis AI.',
    'lab',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'WebRTC'],
    2024,
    'published',
    true,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop&auto=format',
    ARRAY['Rizky Pratama', 'Ahmad Fauzi'],
    '1st Place — National Tech Competition 2024',
    NULL,
    NULL,
    0
  ),
  (
    '2',
    'campusnav-app',
    'CampusNav',
    'Navigasi Kampus Cerdas',
    'Aplikasi navigasi kampus indoor-outdoor yang memanfaatkan AR dan pemetaan kepadatan pengguna secara real-time melalui BLE beacon.',
    'lab',
    ARRAY['Flutter', 'ARKit', 'BLE', 'Firebase'],
    2024,
    'published',
    true,
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&auto=format',
    ARRAY['Budi Santoso', 'Dewi Rahayu'],
    'Best Mobile App — Gemastik 2024',
    NULL,
    NULL,
    1
  ),
  (
    '3',
    'workshop-excel-data',
    'Workshop Excel & Data',
    'Materi Pelatihan Staf dan Mahasiswa',
    'Membuat materi pembelajaran interaktif untuk Excel agar staf kampus dan mahasiswa non-IT dapat mengolah data secara lebih mudah dan efektif.',
    'academy',
    ARRAY['Excel', 'Google Workspace', 'Training'],
    2024,
    'published',
    true,
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop&auto=format',
    ARRAY['Budi Santoso', 'Intan Permata'],
    '',
    NULL,
    NULL,
    2
  ),
  (
    '4',
    'campus-event-poster',
    'Campus Event Poster Design',
    'Aset Kreatif untuk Acara Kampus',
    'Mendesain berbagai kebutuhan publikasi seperti poster, banner, dan aset media sosial untuk acara tahunan kampus dan UKM lain.',
    'creative',
    ARRAY['Figma', 'Canva', 'Photoshop', 'Illustrator'],
    2023,
    'published',
    false,
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=500&fit=crop&auto=format',
    ARRAY['Siti Nurhaliza', 'Ayu Pertiwi'],
    '',
    NULL,
    NULL,
    3
  ),
  (
    '5',
    'pc-clinic',
    'PC Clinic',
    'Layanan Perbaikan Gratis',
    'Layanan perbaikan laptop dan HP gratis untuk mahasiswa, mulai dari instal ulang sistem operasi, pembersihan virus, hingga konsultasi upgrade perangkat.',
    'lab',
    ARRAY['PC Building', 'Repair', 'Windows', 'Hardware'],
    2024,
    'published',
    false,
    'https://images.unsplash.com/photo-1597872253142-0a8ca520fb55?w=800&h=500&fit=crop&auto=format',
    ARRAY['Fajar Nugroho', 'Galih Pratomo'],
    'Best Community Service 2024',
    NULL,
    NULL,
    4
  ),
  (
    '6',
    'wisec-toolkit',
    'WiSec Toolkit',
    'Platform Kesadaran Keamanan Siber',
    'Platform pelatihan keamanan siber interaktif dengan simulasi phishing, tantangan CTF, serta panduan aman beraktivitas di dunia digital.',
    'lab',
    ARRAY['Python', 'Django', 'Docker', 'Security'],
    2023,
    'published',
    false,
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop&auto=format',
    ARRAY['Hendro Wijaya', 'Dimas Setiawan'],
    '',
    NULL,
    NULL,
    5
  )

INSERT INTO public.members (
  id,
  name,
  role,
  division_id,
  year,
  avatar,
  github,
  linkedin,
  active,
  sort_order
) VALUES
  ('1', 'IDDRUS, M.Kom', 'Pembina', NULL, '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=IDDRUS', '', '', true, 0),
  ('2', 'Sulfa eka safira', 'Ketua', NULL, '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sulfa', '', '', true, 1),
  ('3', 'Gibran aljilani', 'Wakil Ketua', NULL, '2024', '/foto-angota/ghibrancakep.jpeg', '', '', true, 2),
  ('4', 'Zhubdatul fadhilah', 'Sekretaris', NULL, '2024', '/foto-angota/zhuu.jpeg', '', '', true, 3),
  ('5', 'Oktari fitriani anwar', 'Wakil Sekretaris', NULL, '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oktari', '', '', true, 4),
  ('6', 'Rumsil lailiyatun nuraini', 'Bendahara', NULL, '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rumsil', '', '', true, 5),
  ('7', 'Nurul intan aulia H', 'Wakil Bendahara', NULL, '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul', '', '', true, 6),
  ('8', 'Muhammad Jasuli', 'Ketua Divisi', 'academy', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasuli', '', '', true, 7),
  ('9', 'Ach. Faiz mahmudi', 'Anggota', 'academy', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faiz', '', '', true, 8),
  ('10', 'Dina Safitri', 'Anggota', 'academy', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dina', '', '', true, 9),
  ('11', 'Lailatul Hasanah', 'Anggota', 'academy', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lailatul', '', '', true, 10),
  ('12', 'Wildan khuzamy faradis', 'Ketua Divisi', 'lab', '2024', '/foto-angota/wildanz.jpeg', '', '', true, 11),
  ('13', 'Nofan nelandi R', 'Anggota', 'lab', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nofan', '', '', true, 12),
  ('14', 'Nur Hartatik', 'Anggota', 'lab', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hartatik', '', '', true, 13),
  ('15', 'Wafika Jamila hadi', 'Anggota', 'lab', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wafika', '', '', true, 14),
  ('16', 'Mukhlishatul afifah', 'Ketua Divisi', 'creative', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mukhlishatul', '', '', true, 15),
  ('17', 'Moh Hazmi Farhadinoto', 'Anggota', 'creative', '2024', '/foto-angota/hazmigantengbanget.jpeg', '', '', true, 16),
  ('18', 'Irfan Haryanto', 'Anggota', 'creative', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Irfan', '', '', true, 17),
  ('19', 'Zian ayu fitri R', 'Anggota', 'creative', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zian', '', '', true, 18),
  ('20', 'Alya faradiana', 'Anggota', 'creative', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alya', '', '', true, 19),
  ('21', 'Trio lestari rais sobri', 'Ketua Divisi', 'connect', '2024', '/foto-angota/dio.jpeg', '', '', true, 20),
  ('22', 'Moh Jufri', 'Anggota', 'connect', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jufri', '', '', true, 21),
  ('23', 'Liana Intan Prastika', 'Anggota', 'connect', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liana', '', '', true, 22),
  ('24', 'Dzul kifli', 'Anggota', 'connect', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dzul', '', '', true, 23),
  ('25', 'Robitul auliya'' alfayedz', 'Anggota', 'connect', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robitul', '', '', true, 24),
  ('26', 'Adelia mahardika puteri', 'Ketua Divisi', 'research', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adelia', '', '', true, 25),
  ('27', 'Dewa putra kusuma', 'Anggota', 'research', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewa', '', '', true, 26),
  ('28', 'Utami Tri Hapsari', 'Anggota', 'research', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Utami', '', '', true, 27),
  ('29', 'Ach Fikri Maulana Putra', 'Anggota', 'research', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fikri', '', '', true, 28),
  ('30', 'Balwanindyta Akrida Putri', 'Anggota', 'research', '2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Balwanindyta', '', '', true, 29)

INSERT INTO public.albums (
  id,
  slug,
  title,
  description,
  cover_image,
  date,
  sort_order
) VALUES
  (
    '1',
    'gemastik-2024',
    'Gemastik 2024',
    'National competition highlights from Gemastik XVII at Universitas Diponegoro, Semarang.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&auto=format',
    '2024-11-15',
    0
  ),
  (
    '2',
    'workshop-ai-2024',
    'AI Workshop Series',
    'Three-day intensive workshop on modern AI/ML techniques, featuring speakers from top tech companies.',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop&auto=format',
    '2024-09-20',
    1
  ),
  (
    '3',
    'orientation-2024',
    'Member Orientation 2024',
    'Welcoming the newest batch of Witech members with hands-on workshops and team bonding activities.',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=500&fit=crop&auto=format',
    '2024-08-05',
    2
  ),
  (
    '4',
    'hackathon-internal-2024',
    'Internal Hackathon 2024',
    '24-hour internal hackathon where cross-division teams built complete projects from scratch.',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop&auto=format',
    '2024-07-12',
    3
  )

INSERT INTO public.album_photos (album_id, image_url, sort_order) VALUES
  ('1', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&auto=format', 1),
  ('1', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop&auto=format', 2),
  ('1', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=800&fit=crop&auto=format', 3),
  ('1', 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1200&h=800&fit=crop&auto=format', 4),
  ('1', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&h=800&fit=crop&auto=format', 5),
  ('1', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=800&fit=crop&auto=format', 6),
  ('2', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=800&fit=crop&auto=format', 1),
  ('2', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=800&fit=crop&auto=format', 2),
  ('2', 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200&h=800&fit=crop&auto=format', 3),
  ('2', 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&fit=crop&auto=format', 4),
  ('2', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=800&fit=crop&auto=format', 5),
  ('2', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop&auto=format', 6),
  ('3', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=800&fit=crop&auto=format', 1),
  ('3', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop&auto=format', 2),
  ('3', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&h=800&fit=crop&auto=format', 3),
  ('3', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&auto=format', 4),
  ('3', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop&auto=format', 5),
  ('3', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800&fit=crop&auto=format', 6),
  ('4', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&auto=format', 1),
  ('4', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&auto=format', 2),
  ('4', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop&auto=format', 3),
  ('4', 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200&h=800&fit=crop&auto=format', 4),
  ('4', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=800&fit=crop&auto=format', 5),
  ('4', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=800&fit=crop&auto=format', 6)

INSERT INTO public.events (
  id,
  title,
  date,
  start_time,
  end_time,
  location,
  type,
  description,
  image,
  registration_open,
  registration_link
) VALUES
  (
    'evt-1',
    'Workshop UI/UX Design Figma',
    '2024-10-12',
    '09:00',
    '12:00',
    'Lab Komputer Utama',
    'Workshop',
    'Belajar bikin desain aplikasi kece pakai Figma dari nol! Cocok buat kamu yang pengen jadi UI/UX Designer.',
    'https://images.unsplash.com/photo-1541462608143-67571c6738dd',
    true,
    '#'
  ),
  (
    'evt-2',
    'Ngoding Bareng Web Dev',
    '2024-10-20',
    '13:00',
    '16:00',
    'Student Center Lt. 3',
    'Bootcamp',
    'Bikin website portofolio pertamamu pakai HTML & CSS. Gak perlu bingung, kita pandu step by step.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    true,
    '#'
  ),
  (
    'evt-3',
    'Sharing Session: Tips Juara Gemastik',
    '2024-11-02',
    '19:00',
    '21:00',
    'Online via Zoom',
    'Sharing Session',
    'Ngobrol santai bareng kakak tingkat yang menang lomba Gemastik. Bongkar rahasia dan tips dari mereka!',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    false,
    NULL
  )

INSERT INTO public.faqs (
  id,
  question,
  answer,
  sort_order
) VALUES
  ('1', 'Harus anak IT kah untuk ikut serta di WiTech?', 'Tidak perlu. WiTech terbuka untuk semua jurusan. Kamu tetap bisa belajar teknologi sesuai minat, baik untuk kebutuhan akademik, proyek, maupun pengembangan diri.', 0),
  ('2', 'Bagaimana cara bergabung menjadi anggota WiTech?', 'Pendaftaran biasanya dibuka dua kali dalam setahun, yaitu pada awal semester ganjil dan genap. Prosesnya biasanya dimulai dari pengisian formulir, lalu sesi perkenalan singkat dan orientasi anggota.', 1),
  ('3', 'Apakah ada biaya untuk bergabung?', 'Pendaftaran umumnya gratis. Setelah menjadi anggota aktif, biasanya ada iuran organisasi per semester untuk mendukung kebutuhan kegiatan, alat, dan acara komunitas.', 2),
  ('4', 'Apakah kegiatan WiTech mengganggu jadwal kuliah?', 'Kegiatan kami dibuat agar tetap fleksibel. Biasanya, waktu yang dibutuhkan sekitar 4–6 jam per minggu untuk rapat divisi atau pengerjaan proyek.', 3),
  ('5', 'Apa manfaat mengikuti WiTech?', 'Manfaatnya cukup besar. Kamu dapat mengembangkan keterampilan yang relevan dengan dunia kerja, memperluas jaringan, dan memiliki pengalaman dalam mengerjakan proyek nyata.', 4),
  ('6', 'Kalau saya benar-benar pemula, divisi mana yang cocok?', 'Semua divisi terbuka untuk pemula. Jika kamu ingin memulai dari dasar, pilih divisi yang fokus pada pembelajaran dan praktik dasar terlebih dahulu, lalu berkembang sesuai minat.', 5),
  ('7', 'Apakah WiTech menerima kerja sama atau kolaborasi proyek?', 'Tentu. Kami terbuka untuk kolaborasi dengan organisasi lain, dosen, maupun mitra eksternal. Silakan hubungi email partnership@witech.id atau akun media sosial resmi WiTech.', 6),
  ('8', 'Di mana saya bisa melihat karya WiTech?', 'Kamu bisa melihatnya di halaman Portfolio website ini. Di sana tersedia contoh karya dari berbagai divisi, mulai dari desain, pengembangan web, hingga karya berbasis teknologi lainnya.', 7)

COMMIT;
