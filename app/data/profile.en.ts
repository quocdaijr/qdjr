import type {ProfileContent} from './profile'

export const PROFILE_EN: ProfileContent = {
  profile: {
    name: 'Nguyen Quoc Dai',
    displayName: 'Quoc Dai Nguyen',
    role: 'Senior Backend Software Engineer',
    photo: '/profile.jpg',
    photoAlt: 'Quoc Dai Nguyen - Senior Backend Software Engineer Profile Photo',
    summary:
      'Backend Software Engineer with 6+ years of experience building and operating high-performance backend systems for media and e-commerce platforms. Strong background in system design, performance optimization, background processing, and third-party integrations. Experienced in owning and operating production systems at scale.'
  },
  quote: {text: 'First, solve the problem. Then, write the code', author: 'John Johnson'},
  skills: [
    {group: 'Programming Languages', expert: 'PHP (Yii2, Laravel)', proficient: 'Node.js (NestJS, AdonisJS), Python, JavaScript'},
    {group: 'Database & Storage', expert: 'MySQL, Redis, Elasticsearch', proficient: 'MongoDB, Database optimization, Query performance tuning'},
    {group: 'Messaging & Streaming', expert: 'RabbitMQ', proficient: 'Kafka'},
    {group: 'DevOps & Infrastructure', expert: 'Linux, Docker, Nginx, Git, Supervisor', proficient: 'Kubernetes, CI/CD Pipelines, AWS'},
    {group: 'Frontend Technologies', proficient: 'Vue.js, Nuxt.js, HTML5, CSS3, Tailwind CSS'},
    {
      group: 'Third-party Integrations',
      note: 'Shopify, E-commerce platforms, Payment gateways, Analytics & tracking services, Customer engagement tools, Real-time communication systems, Project management platforms, API testing tools'
    }
  ],
  otherSkills: [
    {label: 'Production Readiness', text: 'Experienced in system observability, monitoring, and incident response for production environments'},
    {label: 'Team Collaboration', text: 'Strong communication skills and technical knowledge sharing across cross-functional teams'},
    {label: 'Problem Solving', text: 'Strong analytical skills in debugging complex systems and architecting scalable solutions for high-traffic applications'},
    {label: 'Continuous Learning', text: 'Actively stay current with emerging technologies and implement modern development practices'},
    {label: 'Interests', text: 'Sports (Football, Running), Technology trends, System architecture'}
  ],
  timeline: [
    {
      period: '08/2014 - 12/2018',
      org: 'HCMC University of Natural Resources and Environment',
      kind: 'education',
      major: 'Information Technology',
      degree: "Engineer's Degree",
      achievements: []
    },
    {
      period: '08/2018 - 07/2019',
      org: 'Applancer JSC - Onsite at Tuoi Tre Newspaper',
      kind: 'work',
      position: 'Web Developer',
      technologies: 'PHP, Yii2 Framework, MySQL, Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor',
      achievements: [
        'Actively maintained and enhanced backend components of production web platforms',
        'Participated directly in developing features for high-traffic websites operating in production environments',
        'Involved in development and deployment workflows within Linux-based and containerized setups'
      ]
    },
    {
      period: '07/2019 - 08/2022',
      org: 'Tuoi Tre Newspaper',
      kind: 'work',
      position: 'Software Development Engineer',
      technologies:
        'PHP, Python, Yii2 Framework, Django Rest Framework, MySQL, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry',
      achievements: [
        'Maintained and evolved backend systems for high-traffic news platforms operating in production environments',
        'Designed database schemas and developed backend APIs and internal tools for content and editorial workflows',
        'Built reusable internal packages and modular backend components to improve maintainability and development efficiency',
        'Developed background processing and automation tools for data synchronization, transformation, and aggregation',
        'Implemented and operated production deployments, service configurations, monitoring, and logging to ensure system reliability',
        'Researched and implemented a Single Sign-On (SSO) authentication solution across multiple platforms'
      ]
    },
    {
      period: '08/2022 - Present',
      org: 'FireGroup Technology',
      kind: 'work',
      position: 'Senior Backend Software Engineer',
      technologies:
        'PHP, Python, Node.js, Laravel Framework, NestJS, MySQL, Redis, RabbitMQ, Kafka, GitLab, Linux, Docker, Kubernetes, Supervisor, Sentry, Rancher',
      thirdParties: 'Shopify, Jira, Segment, CustomerIO, Crisp Chat',
      achievements: [
        'Designed and developed backend services and background processing systems for Shopify-based applications, with a focus on performance and reliability',
        'Architected database schemas and core backend components, contributing to technical planning and implementation decisions across backend systems',
        'Owned and maintained Shopify application backends, ensuring system stability, scalability, and continuous service delivery',
        'Integrated third-party platforms and internal services to extend product capabilities and streamline business workflows',
        'Collaborated with DevOps teams to configure Kubernetes deployments and integrate monitoring and observability for backend services',
        'Utilized AI-assisted development tools to support code generation, debugging, and daily development productivity'
      ]
    }
  ],
  projects: [
    {name: 'OneMobile ‑ Mobile App Builder', image: '/images/projects/om.webp', alt: 'OneMobile', url: 'https://onemobile.ai', description: 'Turn your store into a mobile app with OneMobile. Scale brand, reduce ad costs & retain customers.', role: 'Backend Software Engineer - Backend services, analytics & reporting, third-party integrations.'},
    {name: 'OneLoyalty: Loyalty & Rewards', image: '/images/projects/ol.webp', alt: 'OneLoyalty', url: 'https://oneloyalty.io', description: 'Easily run loyalty and referral programs that drive sales, customer retention rate & lifetime value.', role: 'Backend Software Engineer - Built core backend systems and business logic from scratch.'},
    {name: 'Transcy: AI Language Translate', image: '/images/projects/tc.webp', alt: 'Transcy', url: 'https://transcy.io', description: "Translate store's language with OpenAI, DeepL, Gemini, Baidu, etc. Convert Currency to sell globally", role: 'Backend Software Engineer - Translation services, performance optimization, AI provider integrations.'},
    {name: 'Swift SEO Page Speed Optimizer', image: '/images/projects/sw.webp', alt: 'Swift', url: 'https://onecommerce.io/swift', description: 'Easily boost your SEO and page speed. Websites that rank higher and load faster convert better.', role: 'Backend Software Engineer - Backend rebuild and SEO feature development.'},
    {name: 'FireGroup - OneExpert Internal Tools & Systems', image: '/images/projects/fg.webp', alt: 'FireGroup Internal', description: 'Internal backend platform enabling CS, TS, and Expert teams to deliver Expert services across FireGroup applications.', role: 'Backend Software Engineer - Designed and built internal backend systems, integrated across FireGroup products.'},
    {name: 'SSO Tuoitre Authentication System', image: '/images/projects/tt.webp', alt: 'SSO Tuoitre', url: 'https://sso.tuoitre.vn', description: 'Centralized single sign-on platform for Tuoi Tre digital services.', role: 'Software Development Engineer - Designed and implemented SSO architecture, authentication flows, and security mechanisms.'},
    {name: 'Tuoi Tre Rao Vat', image: '/images/projects/ttrv.webp', alt: 'Tuoi Tre Rao Vat', url: 'https://raovat.tuoitre.vn', description: 'Online marketplace platform operated by Tuoi Tre Newspaper.', role: 'Software Development Engineer - Maintained existing backend features and developed new functionalities.'},
    {name: 'Tuoi Tre Cuoi', image: '/images/projects/ttc.webp', alt: 'Tuoi Tre Cuoi', url: 'https://cuoi.tuoitre.vn', description: 'Humor and satire content platform under Tuoi Tre Newspaper.', role: 'Software Development Engineer - Developed and maintained backend features for content and comment management.'},
    {name: 'Tuoi Tre News', image: '/images/projects/ttn.webp', alt: 'Tuoi Tre News', url: 'https://news.tuoitre.vn', description: 'English news website of Tuoi Tre Newspaper', role: 'Software Development Engineer - Maintained and enhanced backend features to support content delivery.'},
    {name: 'Tuoi Tre Internal Tools', image: '/images/projects/tt.webp', alt: 'Tuoi Tre Internal', description: 'Internal systems supporting newsroom and operational workflows.', role: 'Software Development Engineer - Built internal tools from scratch and migrated legacy systems to modern backend architectures.'}
  ],
  contact: [
    {label: 'Name', value: 'Quoc Dai Nguyen'},
    {label: 'Phone', value: '+84969-113-505', href: 'tel:+84969113505'},
    {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
    {label: 'Experience', value: '6+ years in web development'},
    {label: 'Role', value: 'Senior Backend Software Engineer'},
    {label: 'Date of Birth', value: '27/10/1996'},
    {label: 'Address', value: 'My Chanh Commune, Phu My District, Binh Dinh Province'}
  ]
}
