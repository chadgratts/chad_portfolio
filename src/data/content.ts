export const siteConfig = {
  name: 'Chad Gratts',
  email: 'garrettgratts21@gmail.com',
  description:
    'Chad Gratts is a software engineer who specializes in building (and occasionally designing) exceptional digital experiences.',
  siteUrl: 'https://chadgratts.com',
  socialMedia: [
    { name: 'GitHub', url: 'https://github.com/chadgratts' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/chadgratts/' },
  ],
  navLinks: [
    { name: 'About', url: '#about' },
    { name: 'Experience', url: '#experience' },
    { name: 'Projects', url: '#projects' },
    { name: 'Books', url: '#books' },
    { name: 'Contact', url: '#contact' },
  ],
};

export const skills = [
  'JavaScript',
  'TypeScript',
  'Node.js',
  'AWS',
  'React',
  'Docker',
];

export interface Job {
  title: string;
  company: string;
  location: string;
  range: string;
  url: string;
  bullets: string[];
}

export const jobs: Job[] = [
  {
    title: 'Open Source Software Engineer',
    company: 'Mozilla Firefox',
    location: 'Remote',
    range: 'Feb 2026 - Present',
    url: 'https://www.mozilla.org/en-US/firefox/',
    bullets: [
      'Updated legacy APIs in the Async Pan/Zoom scrolling subsystem to align with the transition to WebRender rendering architecture, improving the scrolling and rendering pipeline',
      'Simplified Firefox\'s wheel event handling pipeline by removing an obsolete rollout preference and consolidating logic across DOM events and APZ components',
      'Built and tested custom Firefox builds locally using Mozilla\'s mach build system and collaborated with Firefox engineers through code review until patches were merged',
    ],
  },
  {
    title: 'Founding Engineer',
    company: 'Providence',
    location: 'New York, NY',
    range: 'Aug 2024 - Present',
    url: 'https://providence-replay.github.io/',
    bullets: [
      'Built an AI-powered session replay and analytics platform end to end, spanning client instrumentation, backend ingestion, preprocessing pipelines, summarization, RAG retrieval, and query workflows',
      'Designed and implemented a RAG-based natural language search system using ETL pipelines, vector embeddings in Qdrant, and OpenAI APIs allowing teams to query user behavior in plain English',
      'Engineered a preprocessing and summarization pipeline transforming raw rrweb replay data into structured summaries, eliminating hours of manual session review for product and UX teams',
      'Architected a multi-database storage layer using Redis, PostgreSQL, S3-compatible object storage (MinIO), and Qdrant, with automated ETL jobs reducing query and retrieval latency by approximately 5x',
      'Deployed and operated AWS infrastructure supporting scalable, high-availability production workloads, including storage, compute, and background processing components',
    ],
  },
  {
    title: 'Open-Source Contributor',
    company: 'Mastra AI',
    location: 'Remote',
    range: 'Feb 2025 - Mar 2025',
    url: 'https://github.com/mastra-ai/mastra',
    bullets: [
      'Added Google Cloud and Microsoft Azure Text-to-Speech APIs, expanding multi-provider voice support',
      'Implemented integration and regression tests using Vitest to validate API responses across providers',
    ],
  },
  {
    title: 'Flutist',
    company: 'Independent Musician',
    location: 'United States',
    range: 'Jun 2020 - Jan 2022',
    url: 'https://youtu.be/J_NY4KMgTuA',
    bullets: [
      'Performed as soloist and ensemble member (choirs, recitals, theatre). Built the discipline, focus, and stage composure I now apply to shipping software',
    ],
  },
];

export interface FeaturedProject {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  external?: string;
  image: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    title: 'AI Vision Board Generator',
    description:
      'Gemini CLI hackathon project: a CLI tool that scans local files and photos, extracts themes with Gemini, and outputs a personalized vision board as HTML and PNG.',
    tech: ['Python', 'Gemini API', 'CLI'],
    github: 'https://github.com/ikulkarni13/gemini_cli_hack',
    image: '/images/VisionBoard.png',
  },
  {
    title: 'Requesty',
    description:
      'Request Bin is a webhook and HTTP request inspection tool designed to help developers debug and analyze incoming HTTP requests. The project was both a technical challenge and an opportunity to creatively address common debugging issues.',
    tech: ['Node.js', 'Express', 'React', 'MongoDB', 'PostgreSQL'],
    github: 'https://github.com/chadgratts/request_bin',
    image: '/images/RequestBin.png',
  },
  {
    title: 'Rental Flow',
    description:
      'Rental Flow is an apartment hunting planner app that keeps track of available units inside apartment buildings. I aimed to keep it functional, fairly intuitive to use and not overly complex.',
    tech: ['Ruby', 'PostgreSQL', 'Sinatra', 'Handlebars', 'AJAX'],
    github: 'https://github.com/chadgratts/rentalFlow',
    image: '/images/RentalFlow.png',
  },
];

export interface Book {
  title: string;
  cover: string;
  external: string;
  category: string;
}

export const books: Book[] = [
  {
    title: '10X Rule',
    cover: '/images/books/10XRule.png',
    external:
      'https://books.google.com/books/about/The_10X_Rule.html?id=pDCPCgAAQBAJ',
    category: 'Motivation',
  },
  {
    title: '1984',
    cover: '/images/books/1984.png',
    external:
      'https://books.google.com/books/about/1984.html?id=kotPYEqx7kMC',
    category: 'Motivation',
  },
  {
    title: 'Am I Being Too Subtle?',
    cover: '/images/books/AmIBeingTooSubtle.png',
    external:
      'https://books.google.com/books/about/Am_I_Being_Too_Subtle.html?id=VjyQEAAAQBAJ',
    category: 'Business',
  },
  {
    title: 'Be Obsessed or Be Average',
    cover: '/images/books/BeObsessedOrBeAverage.png',
    external:
      'https://books.google.com/books/about/Be_Obsessed_or_Be_Average.html?id=KgcIDQAAQBAJ',
    category: 'Motivation',
  },
  {
    title: 'Data Structures and Algorithms in Python',
    cover: '/images/books/DSABook.png',
    external:
      'https://books.google.com/books/about/A_Common_Sense_Guide_to_Data_Structures.html?id=dg4CEAAAQBAJ',
    category: 'Algorithms',
  },
  {
    title: 'Letting Go',
    cover: '/images/books/LettingGo.png',
    external:
      'https://books.google.com/books/about/Letting_Go.html?id=7i9qBgAAQBAJ',
    category: 'Personal Growth',
  },
  {
    title: 'On Having No Head',
    cover: '/images/books/OnHavingNoHead.png',
    external:
      'https://books.google.com/books/about/On_Having_No_Head.html?id=IOyAPwAACAAJ',
    category: 'Philosophy',
  },
  {
    title: 'Power vs Force',
    cover: '/images/books/PowerVsForce.png',
    external:
      'https://books.google.com/books/about/Power_vs_Force.html?id=EzBqBgAAQBAJ',
    category: 'Philosophy',
  },
  {
    title: 'Reminiscences of a Stock Operator',
    cover: '/images/books/ReminiscencesOfAStockOperator.png',
    external:
      'https://books.google.com/books/about/Reminiscences_Of_A_Stock_Operator.html?id=N7oOegCx4eUC',
    category: 'Finance',
  },
  {
    title: 'The Power of Awareness',
    cover: '/images/books/ThePoweOfAwareness.png',
    external:
      'https://books.google.com/books/about/The_Power_of_Awareness.html?id=Ek4SEQAAQBAJ',
    category: 'Personal Growth',
  },
  {
    title: 'The Science of Getting Rich',
    cover: '/images/books/TheScienceOfGettingRich.png',
    external:
      'https://books.google.com/books/about/The_Science_of_Getting_Rich.html?id=EpDPDwAAQBAJ',
    category: 'Wealth',
  },
  {
    title: 'The Secret of Secrets',
    cover: '/images/books/TheSecretOfSecrets.png',
    external:
      'https://books.google.com/books/about/The_Secret_of_Secrets.html?id=lMPWDgAAQBAJ',
    category: 'Spirituality',
  },
  {
    title: 'Undisputed Truth',
    cover: '/images/books/UndsiputedTruth.png',
    external:
      'https://books.google.com/books/about/Undisputed_Truth.html?id=mV4TAAAAQBAJ',
    category: 'Biography',
  },
  {
    title: 'Why We Sleep',
    cover: '/images/books/WhyWeSleep.png',
    external:
      'https://books.google.com/books/about/Why_We_Sleep.html?id=-fKlDgAAQBAJ',
    category: 'Health and Fitness',
  },
];
