import { JobPosting, LearningResource, SkillTrendRecord } from '../types';

export const SEED_JOB_POSTINGS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Full Stack Cloud Engineer',
    company: 'Nexis Cloud Systems',
    location: 'Remote / Bengaluru, India',
    experienceLevel: 'Mid',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
    preferredSkills: ['Kubernetes', 'GraphQL', 'Terraform'],
    description: 'We are seeking a Full Stack Cloud Engineer to build scalable microservices and responsive web platforms. You will work on distributed data architectures, implement secure REST APIs, and deploy containers across multi-cloud environments.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://careers.google.com',
    isDemonstration: true,
    postedDate: '2026-09-15',
    updatedAt: '2026-10-01'
  },
  {
    id: 'job-2',
    title: 'AI/ML Applications Developer',
    company: 'Cognitive Dynamics',
    location: 'Remote / San Francisco, CA',
    experienceLevel: 'Mid',
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'Gemini API', 'Docker', 'Vector Databases', 'Prompt Engineering'],
    preferredSkills: ['LangChain', 'MLflow', 'Kubernetes'],
    description: 'Join our applied AI team deploying enterprise generative AI pipelines. Responsibilities include building LLM agents, semantic search retrieval with vector databases, fine-tuning task-specific embeddings, and integrating real-time inference microservices.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://cloud.google.com/vertex-ai',
    isDemonstration: true,
    postedDate: '2026-09-20',
    updatedAt: '2026-10-02'
  },
  {
    id: 'job-3',
    title: 'DevOps & Site Reliability Engineer',
    company: 'Vanguard Infrastructure',
    location: 'Hyderabad, India',
    experienceLevel: 'Mid',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux', 'Terraform', 'AWS', 'Prometheus'],
    preferredSkills: ['Go', 'Ansible', 'Grafana'],
    description: 'Responsible for infrastructure as code, automated continuous deployment pipelines, cluster orchestration, and production observability. Enforce site reliability metrics and zero-trust cloud network security.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://kubernetes.io',
    isDemonstration: true,
    postedDate: '2026-09-18',
    updatedAt: '2026-10-03'
  },
  {
    id: 'job-4',
    title: 'Frontend React & UI/UX Specialist',
    company: 'Aura Interactive',
    location: 'Remote / London, UK',
    experienceLevel: 'Entry',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML5/CSS3', 'Web Accessibility (WCAG)', 'Jest'],
    preferredSkills: ['Next.js', 'Figma', 'GraphQL'],
    description: 'Build polished web interfaces for high-traffic SaaS applications. Deep knowledge of React component lifecycle, modern CSS architectures, state management, and accessibility standards is essential.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://react.dev',
    isDemonstration: true,
    postedDate: '2026-09-25',
    updatedAt: '2026-10-04'
  },
  {
    id: 'job-5',
    title: 'Data Platform Engineer',
    company: 'Apex Data Labs',
    location: 'Remote / Singapore',
    experienceLevel: 'Senior',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Airflow', 'Data Warehousing'],
    preferredSkills: ['Snowflake', 'dbt', 'GCP BigQuery'],
    description: 'Design and optimize data lakehouse ingestion pipelines and streaming systems. Maintain reliable ETL workflows, data validation tests, and analytical warehouse models supporting business intelligence teams.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://spark.apache.org',
    isDemonstration: true,
    postedDate: '2026-09-12',
    updatedAt: '2026-10-05'
  },
  {
    id: 'job-6',
    title: 'Cybersecurity Analyst & SecOps',
    company: 'Sentinel Defense Group',
    location: 'Chennai, India',
    experienceLevel: 'Entry',
    requiredSkills: ['Network Security', 'Linux', 'Vulnerability Assessment', 'Python', 'SIEM Tools', 'Cryptography', 'Identity & Access Management'],
    preferredSkills: ['Wireshark', 'SOC Operations', 'Cloud Security'],
    description: 'Monitor enterprise security events, conduct vulnerability assessments, configure defensive firewalls, and audit zero-trust access control policies across cloud infrastructure.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://cisa.gov',
    isDemonstration: true,
    postedDate: '2026-09-28',
    updatedAt: '2026-10-06'
  },
  {
    id: 'job-7',
    title: 'Backend Go & Distributed Systems Engineer',
    company: 'HyperScale Core',
    location: 'Remote / Berlin, Germany',
    experienceLevel: 'Mid',
    requiredSkills: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Docker', 'Microservices', 'Distributed Systems'],
    preferredSkills: ['Kafka', 'Kubernetes', 'Protobuf'],
    description: 'Develop ultra-low-latency backend microservices handling millions of queries per second. Master concurrent programming, gRPC serialization, connection pooling, and fault-tolerant architecture.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://go.dev',
    isDemonstration: true,
    postedDate: '2026-09-22',
    updatedAt: '2026-10-07'
  },
  {
    id: 'job-8',
    title: 'Mobile Applications Developer (Flutter/React Native)',
    company: 'Pulse Mobility',
    location: 'Pune, India',
    experienceLevel: 'Entry',
    requiredSkills: ['React Native', 'TypeScript', 'Mobile UI Design', 'REST APIs', 'State Management', 'Git', 'Testing'],
    preferredSkills: ['Flutter', 'iOS/Android Native', 'Firebase'],
    description: 'Create cross-platform mobile apps for consumers worldwide. Integrate backend REST and GraphQL APIs, manage offline synchronization, and optimize mobile app rendering performance.',
    dataSource: 'Permitted Curated Tech Corpus',
    sourceUrl: 'https://reactnative.dev',
    isDemonstration: true,
    postedDate: '2026-09-30',
    updatedAt: '2026-10-08'
  }
];

export const SEED_LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'res-1',
    title: 'NPTEL: Cloud Computing & Distributed Systems',
    provider: 'NPTEL',
    skillsCovered: ['Cloud Computing', 'AWS', 'Distributed Systems', 'Docker', 'Virtualization'],
    difficulty: 'Intermediate',
    estimatedDuration: '8 Weeks',
    officialUrl: 'https://nptel.ac.in/courses/106105167',
    isVerified: true,
    type: 'micro_credential',
    rating: 4.8,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-2',
    title: 'Coursera: Meta Front-End Developer Professional Certificate',
    provider: 'Coursera',
    skillsCovered: ['React', 'JavaScript', 'TypeScript', 'HTML5/CSS3', 'Tailwind CSS', 'Web Accessibility (WCAG)'],
    difficulty: 'Beginner',
    estimatedDuration: '7 Months',
    officialUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    isVerified: true,
    type: 'certification',
    rating: 4.9,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-3',
    title: 'edX: CS50 Computer Science and Python Programming',
    provider: 'edX',
    skillsCovered: ['Python', 'SQL', 'Data Structures', 'Algorithms', 'FastAPI'],
    difficulty: 'Beginner',
    estimatedDuration: '10 Weeks',
    officialUrl: 'https://www.edx.org/cs50',
    isVerified: true,
    type: 'course',
    rating: 4.9,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-4',
    title: 'Google Cloud: Professional Cloud Architect Pathway',
    provider: 'Official Documentation',
    skillsCovered: ['GCP', 'Docker', 'Kubernetes', 'Cloud Security', 'Terraform', 'CI/CD Pipelines'],
    difficulty: 'Advanced',
    estimatedDuration: '12 Weeks',
    officialUrl: 'https://cloud.google.com/learn/certification/cloud-architect',
    isVerified: true,
    type: 'certification',
    rating: 4.9,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-5',
    title: 'DeepLearning.AI: Generative AI & LLM Systems Specialization',
    provider: 'Coursera',
    skillsCovered: ['Prompt Engineering', 'PyTorch', 'Vector Databases', 'Gemini API', 'AI & ML', 'FastAPI'],
    difficulty: 'Intermediate',
    estimatedDuration: '6 Weeks',
    officialUrl: 'https://www.coursera.org/specializations/generative-ai-with-llms',
    isVerified: true,
    type: 'micro_credential',
    rating: 4.9,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-6',
    title: 'NPTEL: Database Management Systems & Relational Theory',
    provider: 'NPTEL',
    skillsCovered: ['SQL', 'PostgreSQL', 'Data Warehousing', 'Database Indexing', 'ACID Transactions'],
    difficulty: 'Intermediate',
    estimatedDuration: '8 Weeks',
    officialUrl: 'https://nptel.ac.in/courses/106105175',
    isVerified: true,
    type: 'course',
    rating: 4.7,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-7',
    title: 'Linux Foundation: Certified Kubernetes Administrator (CKA)',
    provider: 'Official Documentation',
    skillsCovered: ['Kubernetes', 'Docker', 'Linux', 'Container Orchestration', 'DevOps'],
    difficulty: 'Advanced',
    estimatedDuration: '10 Weeks',
    officialUrl: 'https://www.cncf.io/certification/cka/',
    isVerified: true,
    type: 'certification',
    rating: 4.8,
    updatedAt: '2026-10-01'
  },
  {
    id: 'res-8',
    title: 'Stanford Online: Cryptography & Network Security',
    provider: 'Stanford Online',
    skillsCovered: ['Cryptography', 'Network Security', 'Vulnerability Assessment', 'Identity & Access Management'],
    difficulty: 'Advanced',
    estimatedDuration: '10 Weeks',
    officialUrl: 'https://online.stanford.edu/courses/soe-ycryptography-cryptography-i',
    isVerified: true,
    type: 'micro_credential',
    rating: 4.9,
    updatedAt: '2026-10-01'
  }
];

export const INITIAL_SKILL_CATALOG = [
  // Languages
  { name: 'Python', category: 'Languages', aliases: ['python3', 'py'] },
  { name: 'TypeScript', category: 'Languages', aliases: ['ts'] },
  { name: 'JavaScript', category: 'Languages', aliases: ['js', 'es6'] },
  { name: 'Go', category: 'Languages', aliases: ['golang'] },
  { name: 'SQL', category: 'Languages', aliases: ['postgres', 'mysql', 'sqlite'] },
  { name: 'Java', category: 'Languages', aliases: ['core java', 'j2ee'] },
  { name: 'C++', category: 'Languages', aliases: ['cpp'] },
  
  // Frameworks & Libraries
  { name: 'React', category: 'Frameworks', aliases: ['reactjs', 'react.js'] },
  { name: 'Node.js', category: 'Frameworks', aliases: ['nodejs', 'express'] },
  { name: 'Next.js', category: 'Frameworks', aliases: ['nextjs'] },
  { name: 'FastAPI', category: 'Frameworks', aliases: ['fast api'] },
  { name: 'Tailwind CSS', category: 'Frameworks', aliases: ['tailwind'] },
  { name: 'PyTorch', category: 'Frameworks', aliases: ['pytorch', 'torch'] },
  { name: 'React Native', category: 'Frameworks', aliases: ['react-native'] },
  
  // Cloud & DevOps
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['containerization', 'containers'] },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['k8s'] },
  { name: 'AWS', category: 'Cloud & DevOps', aliases: ['amazon web services', 'ec2', 's3', 'lambda'] },
  { name: 'Terraform', category: 'Cloud & DevOps', aliases: ['iac', 'infrastructure as code'] },
  { name: 'CI/CD Pipelines', category: 'Cloud & DevOps', aliases: ['github actions', 'gitlab ci', 'jenkins'] },
  { name: 'Linux', category: 'Cloud & DevOps', aliases: ['ubuntu', 'bash', 'shell'] },

  // Databases
  { name: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'psql'] },
  { name: 'Vector Databases', category: 'Databases', aliases: ['pinecone', 'chroma', 'weaviate', 'qdrant'] },
  { name: 'Redis', category: 'Databases', aliases: ['in-memory cache', 'key-value store'] },
  { name: 'MongoDB', category: 'Databases', aliases: ['nosql', 'document db'] },

  // AI & ML
  { name: 'Prompt Engineering', category: 'AI & ML', aliases: ['prompt design', 'few-shot prompting'] },
  { name: 'Gemini API', category: 'AI & ML', aliases: ['google gemini', 'llm integration'] },
  { name: 'Data Warehousing', category: 'AI & ML', aliases: ['bigquery', 'snowflake', 'redshift'] },
  
  // Security & Others
  { name: 'Network Security', category: 'Tools & Protocols', aliases: ['firewalls', 'tcp/ip'] },
  { name: 'REST APIs', category: 'Tools & Protocols', aliases: ['restful', 'api design'] },
  { name: 'Git', category: 'Tools & Protocols', aliases: ['github', 'version control'] },
  { name: 'Web Accessibility (WCAG)', category: 'Tools & Protocols', aliases: ['a11y', 'wcag 2.1'] }
];
