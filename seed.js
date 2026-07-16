const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');
const News = require('./models/News');
const Event = require('./models/Event');
const { Gallery, Album } = require('./models/Gallery');
const Video = require('./models/Video');
const Research = require('./models/Research');
const Contact = require('./models/Contact');

const ensureDatabaseExists = async () => {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sacra';
  const dbName = connectionString.substring(connectionString.lastIndexOf('/') + 1);
  const baseConnectionString = connectionString.substring(0, connectionString.lastIndexOf('/') + 1) + 'postgres';

  console.log(`Connecting to Postgres default server to verify database '${dbName}' exists...`);
  const client = new Client({ connectionString: baseConnectionString });
  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error('Warning during database check/creation step:', error.message);
  } finally {
    await client.end();
  }
};

const seedData = async () => {
  try {
    // 1. Force sync the tables (wipes existing tables to prevent duplicate key errors during seeding)
    console.log('Force-syncing database tables...');
    await sequelize.sync({ force: true });
    console.log('Database synced. Seeding tables...');

    // 2. Seed Users
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    console.log('Seeding Users...');
    await User.bulkCreate([
      {
        name: 'James Sutherland',
        email: 'admin@sacra.org',
        password: hashedPassword,
        role: 'super_admin',
        membershipStatus: 'active',
        initials: 'JS',
        avatarBg: '#2563eb'
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.j@sacra.org',
        password: hashedPassword,
        role: 'admin',
        membershipStatus: 'active',
        initials: 'SJ',
        avatarBg: '#059669',
        university: 'Kibogora Polytechnic',
        department: 'Anesthesiology'
      },
      {
        name: 'Elena Moretti',
        email: 'e.moretti@johnshopkins.edu',
        password: hashedPassword,
        role: 'user',
        membershipStatus: 'pending',
        initials: 'EM',
        avatarBg: '#f59e0b',
        university: 'Johns Hopkins Medicine',
        department: 'Cardiothoracic Surgery',
        studyYear: 'resident'
      },
      {
        name: 'Arthur Vance',
        email: 'a.vance@oxford-medical.edu',
        password: hashedPassword,
        role: 'user',
        membershipStatus: 'pending',
        initials: 'AV',
        avatarBg: '#7c3aed',
        university: 'Oxford University',
        department: 'Anesthesiology & Critical Care',
        studyYear: 'clinical'
      },
      {
        name: 'Liam O\'Connell',
        email: 'liam.oconnell@tcd.ie',
        password: hashedPassword,
        role: 'user',
        membershipStatus: 'active',
        initials: 'LO',
        avatarBg: '#10b981',
        university: 'Trinity College Dublin',
        department: 'Pain Management Research',
        studyYear: 'fellow'
      }
    ]);

    // 3. Seed News / Articles
    console.log('Seeding News...');
    await News.bulkCreate([
      {
        title: 'New Breakthroughs in Perioperative Pain Management',
        sub: 'Published by Research Council',
        content: '<p>The landscape of obstetric anesthesia is undergoing a paradigm shift, driven by a series of high-impact collaborative research projects. Our latest findings suggest that integrating real-time hemodynamic monitoring into standard labor analgesia protocols can reduce adverse maternal events by up to 14%.</p><p>"It\'s not just about the technique," says lead researcher Dr. Elena Rossi, "it\'s about the systemic application of evidence-based safety checklists across diverse clinical environments."</p>',
        category: 'Research',
        author: 'Dr. Sarah Jenkins',
        status: 'Published',
        thumb: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400',
        slug: 'new-breakthroughs-in-perioperative-pain'
      },
      {
        title: 'Upcoming SACRA Annual Symposium in Kigali',
        sub: 'Scheduled releasing Jan 15',
        content: '<p>Join us at the upcoming SACRA Annual Symposium in Kigali, Rwanda. This event brings together students, registrars, and senior anesthetic consultants from across the continent to share local audits and checklist implementations.</p>',
        category: 'Events',
        author: 'James Sutherland',
        status: 'Published',
        thumb: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=400',
        slug: 'upcoming-sacra-annual-symposium'
      },
      {
        title: 'Collaborative Protocol for Pediatric Anesthesia',
        sub: 'Last saved 2 hours ago',
        content: '<p>Draft guidelines outlining standard anesthetic induction compliance rules for pediatric cohorts under 5kg.</p>',
        category: 'Clinical Updates',
        author: 'Dr. Sarah Jenkins',
        status: 'Draft',
        slug: 'collaborative-protocol-pediatric-anesthesia'
      }
    ]);

    // 4. Seed Events
    console.log('Seeding Events...');
    await Event.bulkCreate([
      {
        title: 'SACRA Annual Global Anesthesia Symposium 2026',
        description: 'Our premier annual conference focusing on collaborative student-led anesthetic clinical trials and WHO checklist implementations.',
        date: new Date('2026-10-12T09:00:00.000Z'),
        location: 'K Kigali Convention Centre, Rwanda',
        category: 'Symposiums',
        status: 'Live'
      },
      {
        title: 'Ultrasound-Guided Regional Block Induction Workshop',
        description: 'Hands-on clinical simulation teaching students needle alignment checks and nerve localization guides.',
        date: new Date('2026-08-15T13:00:00.000Z'),
        location: 'Kibogora Polytechnic Anesthesia Sim Lab',
        category: 'Workshops',
        status: 'Live'
      },
      {
        title: 'WHO Surgical Safety Checklist Auditing seminar',
        description: 'Online webinar discussing the implementation audits of surgical safety checklists in rural clinics.',
        date: new Date('2026-05-18T15:00:00.000Z'),
        location: 'Zoom Virtual Conference Room',
        category: 'Outreach',
        status: 'Past'
      }
    ]);

    // 5. Seed Albums & Gallery
    console.log('Seeding Albums...');
    await Album.bulkCreate([
      { name: 'Workshops', description: 'Clinical hands-on workshops photos' },
      { name: 'Symposiums', description: 'Symposia presentations and meetings' },
      { name: 'Outreach', description: 'Community audits and campaigns' }
    ]);

    console.log('Seeding Gallery Items...');
    await Gallery.bulkCreate([
      {
        name: 'Ultrasound-Guided Regional Blocks Workshop',
        type: 'image/jpeg',
        size: '2.4 MB',
        dimensions: '4200 x 5600 px',
        uploadedBy: 'Dr. Sarah Jenkins',
        url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600',
        category: 'Images',
        album: 'Workshops'
      },
      {
        name: 'Airway Safety Audit Symposium Presentation',
        type: 'image/jpeg',
        size: '4.1 MB',
        dimensions: '3000 x 4000 px',
        uploadedBy: 'James Sutherland',
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
        category: 'Images',
        album: 'Symposiums'
      },
      {
        name: 'Simulation Lab: Pediatric Crisis Drill',
        type: 'image/jpeg',
        size: '1.8 MB',
        dimensions: '2400 x 3600 px',
        uploadedBy: 'Dr. Sarah Jenkins',
        url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=600',
        category: 'Images',
        album: 'Workshops'
      },
      {
        name: 'Outreach Campaign: Surgical Safety WHO Checklists',
        type: 'image/jpeg',
        size: '3.5 MB',
        dimensions: '3800 x 2800 px',
        uploadedBy: 'James Sutherland',
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
        category: 'Images',
        album: 'Outreach'
      }
    ]);

    // 6. Seed Videos
    console.log('Seeding Videos...');
    await Video.bulkCreate([
      {
        title: 'Video Laryngoscopy vs Direct Laryngoscopy Trial',
        description: 'Visual recap of the multicenter simulation study on difficult airway intubation rates.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Clinical Trials'
      },
      {
        title: 'WHO Surgical Checklist Implementation Tutorial',
        description: 'How to implement the WHO checklist inside community health clinics.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Outreach'
      }
    ]);

    // 7. Seed Research Studies & Publications
    console.log('Seeding Research...');
    await Research.bulkCreate([
      {
        title: 'Postoperative Cognitive Dysfunction in Elderly Patients',
        description: 'Investigating the incidence of postoperative cognitive impairment in patients aged 65 and above following general anesthesia.',
        investigator: 'Dr. Elena Lopez, et al.',
        status: 'Active',
        progress: 75,
        authors: 'Dr. Elena Lopez, et al.',
        tag: 'Peer Reviewed',
        specialty: 'Neuroanesthesia',
        type: 'study'
      },
      {
        title: 'Safety of Remifentanil PCA in Laboring Women',
        description: 'A multi-center observational trial auditing safety metrics of remifentanil patient-controlled analgesia during labor.',
        investigator: 'Michael Wong, MD',
        status: 'Recruiting',
        progress: 40,
        authors: 'Michael Wong, MD',
        tag: 'Clinical Audit',
        specialty: 'Obstetric',
        type: 'study'
      },
      {
        title: 'Novel Monitoring Techniques for Cardiac Output',
        description: 'Comparing bioimpedance vs thermodilution methods in cardiac surgical cohorts.',
        authors: 'James Smith, MD',
        journal: 'Global Anesthesia & Critical Care Journal',
        date: new Date('2025-06-15T00:00:00.000Z'),
        url: 'https://doi.org/10.1000/xyz123',
        tag: 'Peer Reviewed',
        specialty: 'Cardiothoracic',
        type: 'publication'
      },
      {
        title: 'Epidural vs Continuous Peripheral Nerve Block',
        description: 'An efficacy comparison checklist for pain management and recovery duration after major orthopedic surgeries.',
        authors: 'Anika Kapoor, PhD',
        journal: 'Journal of Pain Management Research',
        date: new Date('2025-11-20T00:00:00.000Z'),
        url: 'https://doi.org/10.1000/abc789',
        tag: 'Review Article',
        specialty: 'Pain Management',
        type: 'publication'
      }
    ]);

    // 8. Seed Contact Messages
    console.log('Seeding Contact Inquiries...');
    await Contact.bulkCreate([
      {
        name: 'Dr. Robert Chen',
        email: 'r.chen@kigali-health.gov',
        subject: 'General Inquiry',
        message: 'Hello, I am interested in coordinating an upcoming WHO checklist audit across our 3 district hospitals in Kigali. Please let me know how we can coordinate support.',
        isRead: false
      },
      {
        name: 'Sandra Ndoli',
        email: 'sandra@ur.ac.rw',
        subject: 'Membership Activation',
        message: 'Dear SACRA committee, I submitted my student application last week. I would love to follow up on my membership registration status. Thank you!',
        isRead: true,
        replyMessage: 'Dear Sandra, your application has been approved and active credentials sent to your email.'
      }
    ]);

    console.log('All seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

const runSeeder = async () => {
  await ensureDatabaseExists();
  await connectDB();
  await seedData();
  await sequelize.close();
  console.log('Database connection closed.');
};

runSeeder();
