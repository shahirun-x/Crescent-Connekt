-- Crescent Connekt — seed data (mirrors lib/seed.ts)
-- Run after schema.sql. Safe to re-run: uses upserts / delete-then-insert.

-- Institutions -------------------------------------------------------------
insert into public.institutions
  (id, name, location, city, established_year, category, description, external_url, latitude, longitude, parent_org, sort_order)
values
  ('crescent-residential-boys-school','Crescent Residential Matriculation Higher Secondary Boys School','Seethakathi Estate, GST Road, Vandalur, Chennai – 600 048','Chennai',1968,'education','The founding institution of the Crescent movement — started in Chetpet in 1968 and moved to the Vandalur campus in 1971. Still primarily a residential boys school, co-educational for day scholars since 2019.','https://crescentschool.net',12.8229,80.0422,'Seethakathi Trust',1),
  ('crescent-girls-school','Crescent Matriculation Higher Secondary School for Girls','24, Dr. S.S. Badrinath Road (formerly Pycrofts Garden Road), Nungambakkam, Chennai – 600 006','Chennai',1976,'education','A matriculation higher secondary school for girls in Nungambakkam, Chennai, extending the Crescent commitment to accessible, values-based education for young women.','https://crescentgirlsschool.com',13.0627,80.2455,'Seethakathi Trust',2),
  ('bsa-crescent-institute','B.S. Abdur Rahman Crescent Institute of Science & Technology','Vandalur, Chennai','Chennai',1984,'education','A deemed-to-be university offering engineering, sciences, management, law and Islamic studies.','https://crescent.education',12.8231,80.0424,'Seethakathi Trust',3),
  ('crescent-innovation-incubation-centre','Crescent Innovation & Incubation Centre (CIIC)','Vandalur, Chennai','Chennai',2017,'innovation','A technology business incubator supporting student and community startups.','https://ciic.io',12.8235,80.0428,'Seethakathi Trust',4),
  ('tbak-college-women','Thassim Beevi Abdul Kader College for Women','8/93, 94, Yousuf Zulaikha Hospital Road, Kilakarai – 623 517','Kilakarai',1988,'education','An arts and science college for women in Kilakarai — autonomous since 2005-06, NAAC ''A'' grade, affiliated to Alagappa University.','https://thassim.ac.in',9.2312,78.7834,'Seethakathi Trust',5),
  ('muthu-zulaikha-public-school','Muthu Zulaikha Public School','Kilakarai, Ramanathapuram','Kilakarai',1993,'education','A CBSE school in Kilakarai providing English-medium schooling.','',9.2320,78.7840,'Seethakathi Trust',6),
  ('yousuf-zulaikha-hospital','Yousuf Zulaikha Medical Centre','Kilakarai, Ramanathapuram','Kilakarai',1987,'healthcare','A medical centre serving Kilakarai and surrounding villages.','',9.2315,78.7830,'Seethakathi Trust',7),
  ('crescent-school-vandalur','Crescent School (CBSE & IGCSE)','Vandalur, Chennai','Chennai',2013,'education','A co-educational school offering both CBSE and Cambridge IGCSE curricula.','https://www.crescentschools.edu.in',12.8240,80.0430,'Seethakathi Trust',8),
  ('crescent-college-education-madurai','Crescent College of Education for Women','Seethakathi Nagar, Natham-Alagar Koil Link Road, Kallampatti, Chathrapatti Post, Madurai – 625 014','Madurai',2005,'education','A teacher-education college for women in Madurai.','http://www.crescentcollegeofeducationforwomen.org',9.9252,78.1198,'All India Islamic Foundation',9),
  ('crescent-yz-school-nursing-madurai','Crescent Yousuf Zulaikha School of Nursing & Research Institute','Seethakathi Nagar, Natham–Alagarkoil Link Road, Kallampatti, Chathrapatti P.O., Madurai – 625 014','Madurai',2008,'healthcare','A nursing school and research institute in Madurai training healthcare professionals.','https://crescentschoolofnursing.in',9.9260,78.1195,'All India Islamic Foundation',10),
  ('buhari-aalim-arabic-college','Kilakarai Bukhari Aalim Arabic College','Crescent Campus, G.S.T. Road, Vandalur, Chennai – 600 048','Chennai',2000,'education','An Arabic and Islamic studies college on the Vandalur campus offering the traditional Aalim course alongside modern subjects.','http://www.bukhariarabiccollege.com',12.8233,80.0426,'All India Islamic Foundation',11),
  ('madurai-crescent-school','Madurai Crescent Matriculation Higher Secondary School for Girls','Seethakathi Nagar, Kallampatti, Madurai – 625 014','Madurai',null,'education','A matriculation higher secondary school for girls serving families in and around Madurai.','http://matric.crescentcampus.in',9.9255,78.1200,'All India Islamic Foundation',12),
  ('nagore-crescent-school','Nagore Crescent Matriculation Higher Secondary School for Girls','Samba Thottam, Mudukku Thazhai Lane, Nagore – 611 002','Nagore',1991,'education','A matriculation higher secondary school for girls in the coastal town of Nagore.','http://crescentcampus.in/ctt',10.8240,79.8420,'All India Islamic Foundation',13),
  ('pearl-matriculation-school','Pearl Matriculation School','Kilakarai, Ramanathapuram','Kilakarai',1993,'education','A matriculation school in Kilakarai focused on foundational learning.','http://www.pearlschool.ac.in',9.2318,78.7838,'Seethakathi Trust',14),
  ('childrens-homes-community-initiatives','Al Mumin KTMS Hamid Sahib Children Home for Girls','Madurai','Madurai',null,'community','A residential children''s home for girls in Madurai, providing care, schooling support and a stable home for underprivileged children.','',9.9258,78.1196,'All India Islamic Foundation',15),
  ('crescent-teachers-training-institute-women','Crescent Teachers Training Institute for Women','Seethakathi Nagar, Natham-Alagar Koil Link Road, Kallampatti, Chathrapatti Post, Madurai – 625 014','Madurai',null,'education','Teacher training institute for women, preparing the next generation of educators with modern pedagogy and strong values.','http://crescentcampus.in/ctt',9.9257,78.1197,'All India Islamic Foundation',16)
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  city = excluded.city,
  established_year = excluded.established_year,
  category = excluded.category,
  description = excluded.description,
  external_url = excluded.external_url,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  parent_org = excluded.parent_org,
  sort_order = excluded.sort_order;

-- Events ----------------------------------------------------------------
delete from public.events where id like 'evt-%';
insert into public.events
  (id, title, date_start, date_end, institution_id, category, location, description, is_featured)
values
  ('evt-founders-day-2026','Crescent Founders'' Day','2026-09-05',null,'bsa-crescent-institute','University','Vandalur Campus, Chennai','Annual commemoration of the founding of the Crescent movement.',true),
  ('evt-alumni-global-meet-2026','Crescent Alumni Meet','2026-09-20',null,null,'Alumni','Chennai + Online','A worldwide gathering of Crescent alumni to connect chapters, mentor students and grow the Member Network.',true),
  ('evt-inter-school-sports-2026','Inter-Crescent Sports Championship','2026-10-10','2026-10-12','crescent-school-vandalur','Sports','Vandalur Campus, Chennai','Athletics, football and kabaddi across every Crescent school.',false),
  ('evt-health-camp-kilakarai-2026','Free Community Health Camp','2026-09-14',null,'yousuf-zulaikha-hospital','Healthcare','Kilakarai, Ramanathapuram','General medicine, eye and dental screening for local families.',false),
  ('evt-research-conclave-2026','Crescent Research & Innovation Conclave','2026-11-03','2026-11-04','crescent-innovation-incubation-centre','Conferences','Vandalur Campus, Chennai','Startup showcase, research papers and industry mentoring.',true),
  ('evt-cultural-fest-2026','Noor — Crescent Cultural Festival','2026-12-05','2026-12-06','tbak-college-women','Cultural','Kilakarai, Ramanathapuram','Music, elocution, art and literary events across Crescent colleges.',false),
  ('evt-nursing-orientation-2026','Nursing Freshers'' Orientation','2026-09-01',null,'crescent-yz-school-nursing-madurai','Healthcare','Madurai','Induction week for the incoming nursing cohort.',false),
  ('evt-teachers-workshop-2026','Network-wide Teachers'' Workshop','2026-10-25',null,'crescent-college-education-madurai','Schools','Madurai','Professional development for teachers from every Crescent school.',false),
  ('evt-community-iftar-drive-2027','Ramadan Community Support Drive','2027-02-20','2027-03-20','childrens-homes-community-initiatives','Community','Multiple locations','Ration kits, scholarships and support for families in the children''s homes.',false),
  ('evt-academic-year-open-2026','Academic Year Opening Assembly','2026-08-31',null,null,'Schools','All campuses','Synchronised opening assembly across the network.',false);

-- News ----------------------------------------------------------------
delete from public.news where id like 'news-%';
insert into public.news
  (id, title, summary, content, institution_id, published_at)
values
  ('news-cgom-launch','Crescent Connekt opens a shared portal for the network','One calendar, one news stream and one directory across all sixteen institutions of the Crescent family.','Crescent Connekt is now live: a platform that supplements — but never replaces — the individual websites of the sixteen institutions across Chennai, Kilakarai, Madurai and Nagore.',null,'2026-08-20'),
  ('news-crescent-institute-ranking','Crescent Institute climbs national research rankings','Sustained investment in laboratories and doctoral programmes lifts research output for a third year.','The B.S. Abdur Rahman Crescent Institute reported growth in funded research projects and publications, with new centres in renewable energy and data science.','bsa-crescent-institute','2026-08-12'),
  ('news-tbak-naac','TBAK College for Women completes accreditation review','The Kilakarai college has submitted its self-study report ahead of a peer-team visit.','Thassim Beevi Abdul Kader College for Women has strengthened community outreach and digital-learning facilities in its latest accreditation cycle.','tbak-college-women','2026-08-05'),
  ('news-yz-hospital-camp','Yousuf Zulaikha Medical Centre treats 1,200 at coastal health camp','A weekend screening drive in Kilakarai reached fishing families with free diagnostics and medicines.','Yousuf Zulaikha Medical Centre ran a large community health camp covering general medicine, paediatrics and eye care, supported by nursing-school volunteers.','yousuf-zulaikha-hospital','2026-07-28'),
  ('news-ciic-cohort','CIIC welcomes its largest startup cohort yet','Fifteen ventures — several founded by Crescent alumni — join the incubator''s acceleration track.','The Crescent Innovation & Incubation Centre has onboarded startups spanning agri-tech, health devices and education.','crescent-innovation-incubation-centre','2026-07-15'),
  ('news-schools-common-calendar','Crescent schools adopt a shared academic calendar','Nine schools have aligned term dates and major events to reduce clashes and enable joint programmes.','Following coordination through Crescent Connekt, the network''s schools have published a common calendar of examinations, holidays and inter-school events for the coming year.',null,'2026-07-02');
