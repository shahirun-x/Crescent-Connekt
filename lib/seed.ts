import type {
  CrescentEvent,
  Institution,
  NewsItem,
  TimelineEntry,
} from "./types";

/**
 * Bundled seed data — the single source of truth used at build time and as a
 * fallback whenever Supabase is not configured or unreachable. The same rows are
 * mirrored in `supabase/schema.sql` for teams that want a live database.
 *
 * External URLs marked with `// TODO verify` are best-effort and should be
 * confirmed against each institution's official website by an editor. Where
 * `external_url` is an empty string the institution has no public website of its
 * own and the UI falls back to a web search ("Search online").
 */

export const INSTITUTIONS: Institution[] = [
  {
    id: "crescent-residential-boys-school",
    name: "Crescent Residential Matriculation Higher Secondary Boys School",
    location:
      "Seethakathi Estate, GST Road, Vandalur, Chennai – 600 048",
    city: "Chennai",
    established_year: 1968,
    category: "education",
    description:
      "The founding institution of the Crescent movement — started in Chetpet in 1968 and moved to the Vandalur campus in 1971. Still primarily a residential boys school, co-educational for day scholars since 2019.",
    external_url: "https://crescentschool.net",
    logo_url: null,
    latitude: 12.8229,
    longitude: 80.0422,
    parent_org: "Seethakathi Trust",
    sort_order: 1,
  },
  {
    id: "crescent-girls-school",
    name: "Crescent Matriculation Higher Secondary School for Girls",
    location:
      "24, Dr. S.S. Badrinath Road (formerly Pycrofts Garden Road), Nungambakkam, Chennai – 600 006",
    city: "Chennai",
    established_year: 1976,
    category: "education",
    description:
      "A matriculation higher secondary school for girls in Nungambakkam, Chennai, extending the Crescent commitment to accessible, values-based education for young women.",
    external_url: "https://crescentgirlsschool.com",
    logo_url: null,
    latitude: 13.0627,
    longitude: 80.2455,
    parent_org: "Seethakathi Trust",
    sort_order: 2,
  },
  {
    id: "bsa-crescent-institute",
    name: "B.S. Abdur Rahman Crescent Institute of Science & Technology",
    location: "Vandalur, Chennai",
    city: "Chennai",
    established_year: 1984,
    category: "education",
    description:
      "A deemed-to-be university offering engineering, sciences, management, law and Islamic studies, and the academic anchor of the Crescent ecosystem.",
    external_url: "https://crescent.education",
    logo_url: null,
    latitude: 12.8231,
    longitude: 80.0424,
    parent_org: "Seethakathi Trust",
    sort_order: 3,
  },
  {
    id: "crescent-innovation-incubation-centre",
    name: "Crescent Innovation & Incubation Centre (CIIC)",
    location: "Vandalur, Chennai",
    city: "Chennai",
    established_year: 2017,
    category: "innovation",
    description:
      "A technology business incubator supporting student and community startups with mentoring, prototyping facilities and seed funding.",
    external_url: "https://ciic.io", // TODO verify
    logo_url: null,
    latitude: 12.8235,
    longitude: 80.0428,
    parent_org: "Seethakathi Trust",
    sort_order: 4,
  },
  {
    id: "tbak-college-women",
    name: "Thassim Beevi Abdul Kader College for Women",
    location:
      "8/93, 94, Yousuf Zulaikha Hospital Road, Kilakarai – 623 517",
    city: "Kilakarai",
    established_year: 1988,
    category: "education",
    description:
      "An arts and science college for women in Kilakarai — autonomous since 2005–06, NAAC 'A' grade, affiliated to Alagappa University — widening access to higher education in the Ramanathapuram region.",
    external_url: "https://thassim.ac.in",
    logo_url: null,
    latitude: 9.2312,
    longitude: 78.7834,
    parent_org: "Seethakathi Trust",
    sort_order: 5,
  },
  {
    id: "muthu-zulaikha-public-school",
    name: "Muthu Zulaikha Public School",
    location: "Kilakarai, Ramanathapuram",
    city: "Kilakarai",
    established_year: 1993,
    category: "education",
    description:
      "A CBSE school in Kilakarai providing structured, English-medium schooling to children across the region.",
    external_url: "", // no standalone website — search fallback
    logo_url: null,
    latitude: 9.232,
    longitude: 78.784,
    parent_org: "Seethakathi Trust",
    sort_order: 6,
  },
  {
    id: "yousuf-zulaikha-hospital",
    name: "Yousuf Zulaikha Medical Centre",
    location: "Kilakarai, Ramanathapuram",
    city: "Kilakarai",
    established_year: 1987,
    category: "healthcare",
    description:
      "A medical centre serving Kilakarai and surrounding villages, part of the Crescent commitment to community healthcare.",
    external_url: "", // no official website — search fallback
    logo_url: null,
    latitude: 9.2315,
    longitude: 78.783,
    parent_org: "Seethakathi Trust",
    sort_order: 7,
  },
  {
    id: "crescent-school-vandalur",
    name: "Crescent School (CBSE & IGCSE)",
    location: "Vandalur, Chennai",
    city: "Chennai",
    established_year: 2013,
    category: "education",
    description:
      "A co-educational school on the Vandalur campus offering both CBSE and Cambridge IGCSE curricula.",
    external_url: "https://www.crescentschools.edu.in", // TODO verify
    logo_url: null,
    latitude: 12.824,
    longitude: 80.043,
    parent_org: "Seethakathi Trust",
    sort_order: 8,
  },
  {
    id: "crescent-college-education-madurai",
    name: "Crescent College of Education for Women",
    location:
      "Seethakathi Nagar, Natham-Alagar Koil Link Road, Kallampatti, Chathrapatti Post, Madurai – 625 014",
    city: "Madurai",
    established_year: 2005,
    category: "education",
    description:
      "A teacher-education college for women in Madurai, preparing qualified educators for schools across Tamil Nadu.",
    external_url: "http://www.crescentcollegeofeducationforwomen.org",
    logo_url: null,
    latitude: 9.9252,
    longitude: 78.1198,
    parent_org: "All India Islamic Foundation",
    sort_order: 9,
  },
  {
    id: "crescent-yz-school-nursing-madurai",
    name: "Crescent Yousuf Zulaikha School of Nursing & Research Institute",
    location:
      "Seethakathi Nagar, Natham–Alagarkoil Link Road, Kallampatti, Chathrapatti P.O., Madurai – 625 014",
    city: "Madurai",
    established_year: 2008,
    category: "healthcare",
    description:
      "A nursing school and research institute in Madurai training healthcare professionals for hospitals and community health programmes.",
    external_url: "https://crescentschoolofnursing.in",
    logo_url: null,
    latitude: 9.926,
    longitude: 78.1195,
    parent_org: "All India Islamic Foundation",
    sort_order: 10,
  },
  {
    id: "buhari-aalim-arabic-college",
    name: "Kilakarai Bukhari Aalim Arabic College",
    location:
      "Crescent Campus, G.S.T. Road, Vandalur, Chennai – 600 048",
    city: "Chennai",
    established_year: 2000,
    category: "education",
    description:
      "An Arabic and Islamic studies college on the Vandalur campus (its name recalls its Kilakarai roots) offering the traditional Aalim course alongside modern subjects.",
    external_url: "http://www.bukhariarabiccollege.com",
    logo_url: null,
    latitude: 12.8233,
    longitude: 80.0426,
    parent_org: "All India Islamic Foundation",
    sort_order: 11,
  },
  {
    id: "madurai-crescent-school",
    name: "Madurai Crescent Matriculation Higher Secondary School for Girls",
    location: "Seethakathi Nagar, Kallampatti, Madurai – 625 014",
    city: "Madurai",
    established_year: null,
    category: "education",
    description:
      "A matriculation higher secondary school for girls serving families in and around Madurai with a broad, activity-rich curriculum.",
    external_url: "http://matric.crescentcampus.in",
    logo_url: null,
    latitude: 9.9255,
    longitude: 78.12,
    parent_org: "All India Islamic Foundation",
    sort_order: 12,
  },
  {
    id: "nagore-crescent-school",
    name: "Nagore Crescent Matriculation Higher Secondary School for Girls",
    location: "Samba Thottam, Mudukku Thazhai Lane, Nagore – 611 002",
    city: "Nagore",
    established_year: 1991,
    category: "education",
    description:
      "A matriculation higher secondary school for girls in the coastal town of Nagore, extending the network's reach along the Coromandel coast.",
    external_url: "http://crescentcampus.in/ctt",
    logo_url: null,
    latitude: 10.824,
    longitude: 79.842,
    parent_org: "All India Islamic Foundation",
    sort_order: 13,
  },
  {
    id: "pearl-matriculation-school",
    name: "Pearl Matriculation School",
    location: "Kilakarai, Ramanathapuram",
    city: "Kilakarai",
    established_year: null,
    category: "education",
    description:
      "A matriculation school in Kilakarai offering affordable, quality schooling with a focus on foundational learning.",
    external_url: "http://www.pearlschool.ac.in",
    logo_url: null,
    latitude: 9.2318,
    longitude: 78.7838,
    parent_org: "Seethakathi Trust",
    sort_order: 14,
  },
  {
    id: "childrens-homes-community-initiatives",
    name: "Al Mumin KTMS Hamid Sahib Children Home for Girls",
    location: "Madurai",
    city: "Madurai",
    established_year: null,
    category: "community",
    description:
      "A residential children's home for girls in Madurai, providing care, schooling support and a stable home for underprivileged children.",
    external_url: "", // no official website — search fallback
    logo_url: null,
    latitude: 9.9258,
    longitude: 78.1196,
    parent_org: "All India Islamic Foundation",
    sort_order: 15,
  },
  {
    id: "crescent-teachers-training-institute-women",
    name: "Crescent Teachers Training Institute for Women",
    location:
      "Seethakathi Nagar, Natham-Alagar Koil Link Road, Kallampatti, Chathrapatti Post, Madurai – 625 014",
    city: "Madurai",
    established_year: null,
    category: "education",
    description:
      "Teacher training institute for women, preparing the next generation of educators with modern pedagogy and strong values.",
    external_url: "http://crescentcampus.in/ctt",
    logo_url: null,
    latitude: 9.9257,
    longitude: 78.1197,
    parent_org: "All India Islamic Foundation",
    sort_order: 16,
  },
];

export const TIMELINE: TimelineEntry[] = [
  {
    year: 1968,
    title: "The first Crescent school",
    description:
      "Crescent Residential Matriculation Higher Secondary Boys School opens in Chetpet, Chennai, sponsored by the Seethakathi Trust. Founded by Alhaj B.S. Abdur Rahman.",
  },
  {
    year: 1971,
    title: "A permanent home in Vandalur",
    description:
      "The school moves to its permanent home at the Seethakathi Estate, GST Road, Vandalur, Chennai — the campus that would grow into the heart of the Crescent ecosystem.",
  },
  {
    year: 1976,
    title: "Education for girls",
    description:
      "Crescent Matriculation Higher Secondary School for Girls is established in Nungambakkam, Chennai, opening the same opportunities to young women.",
  },
  {
    year: 1984,
    title: "Into higher education",
    description:
      "The B.S. Abdur Rahman Crescent Institute of Science & Technology is founded, taking the movement from schooling into engineering and the sciences.",
  },
  {
    year: 1988,
    title: "Reaching the coast",
    description:
      "Thassim Beevi Abdul Kader College for Women opens in Kilakarai, bringing higher education to the Ramanathapuram district.",
  },
  {
    year: 1993,
    title: "A CBSE school in Kilakarai",
    description:
      "Muthu Zulaikha Public School begins, broadening curriculum choice for families in the region.",
  },
  {
    year: 2005,
    title: "Training teachers",
    description:
      "Crescent College of Education is established in Madurai to prepare qualified educators for the wider school network.",
  },
  {
    year: 2008,
    title: "Deemed university status",
    description:
      "The Crescent Institute is recognised as a deemed-to-be university, and the Crescent Yousuf Zulaikha School of Nursing opens in Madurai.",
  },
  {
    year: 2013,
    title: "Global curricula",
    description:
      "Crescent School on the Vandalur campus adds the Cambridge IGCSE programme alongside CBSE.",
  },
  {
    year: 2017,
    title: "Innovation and enterprise",
    description:
      "The Crescent Innovation & Incubation Centre is launched to support student and community startups.",
  },
  {
    year: 2024,
    title: "Toward one network",
    description:
      "Crescent Global Outreach Mission (CGOM) begins coordinating the ecosystem — leading to this unified digital portal.",
  },
];

const iso = (d: string) => new Date(d).toISOString().slice(0, 10);

export const EVENTS: CrescentEvent[] = [
  {
    id: "evt-founders-day-2026",
    title: "Crescent Founders' Day",
    date_start: iso("2026-09-05"),
    date_end: null,
    institution_id: "bsa-crescent-institute",
    institution_name: "B.S. Abdur Rahman Crescent Institute of Science & Technology",
    category: "University",
    location: "Vandalur Campus, Chennai",
    description:
      "Annual commemoration of the founding of the Crescent movement, with alumni, faculty and students from across the network.",
    is_featured: true,
    image_url: null,
  },
  {
    id: "evt-alumni-global-meet-2026",
    title: "Crescent Global Alumni Meet",
    date_start: iso("2026-09-20"),
    date_end: null,
    institution_id: null,
    institution_name: "Crescent Global Outreach Mission",
    category: "Alumni",
    location: "Chennai + Online",
    description:
      "A worldwide gathering of Crescent alumni to connect chapters, mentor students and shape the next phase of Crescent Connect.",
    is_featured: true,
    image_url: null,
  },
  {
    id: "evt-inter-school-sports-2026",
    title: "Inter-Crescent Sports Championship",
    date_start: iso("2026-10-10"),
    date_end: iso("2026-10-12"),
    institution_id: "crescent-school-vandalur",
    institution_name: "Crescent School (CBSE & IGCSE)",
    category: "Sports",
    location: "Vandalur Campus, Chennai",
    description:
      "Athletics, football and kabaddi tournaments bringing together every Crescent school across Tamil Nadu.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-health-camp-kilakarai-2026",
    title: "Free Community Health Camp",
    date_start: iso("2026-09-14"),
    date_end: null,
    institution_id: "yousuf-zulaikha-hospital",
    institution_name: "Yousuf Zulaikha Medical Centre",
    category: "Healthcare",
    location: "Kilakarai, Ramanathapuram",
    description:
      "General medicine, eye and dental screening for families in Kilakarai and neighbouring villages.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-research-conclave-2026",
    title: "Crescent Research & Innovation Conclave",
    date_start: iso("2026-11-03"),
    date_end: iso("2026-11-04"),
    institution_id: "crescent-innovation-incubation-centre",
    institution_name: "Crescent Innovation & Incubation Centre (CIIC)",
    category: "Conferences",
    location: "Vandalur Campus, Chennai",
    description:
      "Startup showcase, research paper presentations and industry mentoring across the Crescent network.",
    is_featured: true,
    image_url: null,
  },
  {
    id: "evt-cultural-fest-2026",
    title: "Noor — Crescent Cultural Festival",
    date_start: iso("2026-12-05"),
    date_end: iso("2026-12-06"),
    institution_id: "tbak-college-women",
    institution_name: "Thassim Beevi Abdul Kader College for Women",
    category: "Cultural",
    location: "Kilakarai, Ramanathapuram",
    description:
      "Music, elocution, art and literary events hosted by TBAK College and open to all Crescent colleges.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-nursing-orientation-2026",
    title: "Nursing Freshers' Orientation",
    date_start: iso("2026-09-01"),
    date_end: null,
    institution_id: "crescent-yz-school-nursing-madurai",
    institution_name:
      "Crescent Yousuf Zulaikha School of Nursing & Research Institute",
    category: "Healthcare",
    location: "Madurai",
    description:
      "Induction week for the incoming nursing cohort, including hospital rotations and community-health briefings.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-teachers-workshop-2026",
    title: "Network-wide Teachers' Workshop",
    date_start: iso("2026-10-25"),
    date_end: null,
    institution_id: "crescent-college-education-madurai",
    institution_name: "Crescent College of Education for Women",
    category: "Schools",
    location: "Madurai",
    description:
      "Professional development on activity-based learning and assessment for teachers from every Crescent school.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-community-iftar-drive-2027",
    title: "Ramadan Community Support Drive",
    date_start: iso("2027-02-20"),
    date_end: iso("2027-03-20"),
    institution_id: "childrens-homes-community-initiatives",
    institution_name: "Al Mumin KTMS Hamid Sahib Children Home for Girls",
    category: "Community",
    location: "Madurai",
    description:
      "Ration kits, scholarships and support for the children of the Al Mumin home and other families across the network.",
    is_featured: false,
    image_url: null,
  },
  {
    id: "evt-academic-year-open-2026",
    title: "Academic Year Opening Assembly",
    date_start: iso("2026-08-31"),
    date_end: null,
    institution_id: null,
    institution_name: "All Crescent Institutions",
    category: "Schools",
    location: "All campuses",
    description:
      "Synchronised opening assembly across the network, with a shared message from the Crescent Global Outreach Mission.",
    is_featured: false,
    image_url: null,
  },
];

export const NEWS: NewsItem[] = [
  {
    id: "news-cgom-launch",
    title: "Crescent Global Outreach Mission launches unified portal",
    summary:
      "A new digital portal will act as a glossary, guide and coordination layer across every institution in the Crescent ecosystem.",
    content:
      "The Crescent Global Outreach Mission (CGOM) has launched Crescent Global, a portal that supplements — but does not replace — the individual websites of institutions across the network. It brings a shared calendar, a unified news stream and a single directory of institutions to help channel the collective efforts of the alma mater.",
    institution_id: null,
    institution_name: "Crescent Global Outreach Mission",
    published_at: iso("2026-08-20"),
    image_url: null,
  },
  {
    id: "news-crescent-institute-ranking",
    title: "Crescent Institute climbs national research rankings",
    summary:
      "Sustained investment in laboratories and doctoral programmes lifts the university's research output for a third consecutive year.",
    content:
      "The B.S. Abdur Rahman Crescent Institute of Science & Technology reported growth in funded research projects and publications this year, with new centres in renewable energy and data science.",
    institution_id: "bsa-crescent-institute",
    institution_name: "B.S. Abdur Rahman Crescent Institute of Science & Technology",
    published_at: iso("2026-08-12"),
    image_url: null,
  },
  {
    id: "news-tbak-naac",
    title: "TBAK College for Women completes accreditation review",
    summary:
      "The Kilakarai college has submitted its self-study report ahead of a peer-team visit, with a focus on rural outreach.",
    content:
      "Thassim Beevi Abdul Kader College for Women has strengthened its community outreach and digital-learning facilities as part of its latest accreditation cycle.",
    institution_id: "tbak-college-women",
    institution_name: "Thassim Beevi Abdul Kader College for Women",
    published_at: iso("2026-08-05"),
    image_url: null,
  },
  {
    id: "news-yz-hospital-camp",
    title: "Yousuf Zulaikha Medical Centre treats 1,200 at coastal health camp",
    summary:
      "A weekend screening drive in Kilakarai reached fishing families with free diagnostics and medicines.",
    content:
      "Yousuf Zulaikha Medical Centre ran a large community health camp covering general medicine, paediatrics and eye care, supported by volunteers from the Crescent nursing school in Madurai.",
    institution_id: "yousuf-zulaikha-hospital",
    institution_name: "Yousuf Zulaikha Medical Centre",
    published_at: iso("2026-07-28"),
    image_url: null,
  },
  {
    id: "news-ciic-cohort",
    title: "CIIC welcomes its largest startup cohort yet",
    summary:
      "Fifteen ventures — several founded by Crescent alumni — join the incubator's new acceleration track.",
    content:
      "The Crescent Innovation & Incubation Centre has onboarded startups spanning agri-tech, health devices and education, with mentoring drawn from the alumni network.",
    institution_id: "crescent-innovation-incubation-centre",
    institution_name: "Crescent Innovation & Incubation Centre (CIIC)",
    published_at: iso("2026-07-15"),
    image_url: null,
  },
  {
    id: "news-schools-common-calendar",
    title: "Crescent schools adopt a shared academic calendar",
    summary:
      "Nine schools across Tamil Nadu have aligned term dates and major events to reduce clashes and enable joint programmes.",
    content:
      "Following coordination through Crescent Global, the network's schools have published a common calendar of examinations, holidays and inter-school events for the coming year.",
    institution_id: null,
    institution_name: "All Crescent Institutions",
    published_at: iso("2026-07-02"),
    image_url: null,
  },
];
