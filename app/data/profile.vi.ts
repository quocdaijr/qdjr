import type {ProfileContent} from './profile'
import {PROFILE_EN} from './profile.en'

// Vietnamese copy. Job titles, project names and technical terms stay in
// English, the way Vietnamese engineers write them; only the surrounding
// prose is Vietnamese (pinned by test/profile.spec.ts).
export const PROFILE_VI: ProfileContent = {
  profile: {
    name: 'Nguyễn Quốc Đại',
    displayName: 'Nguyễn Quốc Đại',
    role: 'Senior Backend Software Engineer',
    photo: '/profile.jpg',
    photoAlt: 'Nguyễn Quốc Đại - Senior Backend Software Engineer',
    summary:
      'Backend Software Engineer với hơn 6 năm kinh nghiệm xây dựng và vận hành các hệ thống backend high-performance cho các nền tảng media và e-commerce. Thế mạnh về system design, performance optimization, background processing và third-party integrations. Có kinh nghiệm làm chủ và vận hành các hệ thống production ở quy mô lớn.'
  },
  quote: {text: 'Trước tiên, hãy giải quyết vấn đề. Sau đó, hãy viết code', author: 'John Johnson'},
  // Skill groups and stacks are technical terms: identical to English.
  skills: PROFILE_EN.skills,
  otherSkills: [
    {label: 'Production Readiness', text: 'Có kinh nghiệm về system observability, monitoring và incident response cho môi trường production'},
    {label: 'Làm việc nhóm', text: 'Giao tiếp tốt và chia sẻ kiến thức kỹ thuật với các team cross-functional'},
    {label: 'Giải quyết vấn đề', text: 'Khả năng phân tích tốt khi debug các hệ thống phức tạp và thiết kế giải pháp scalable cho các ứng dụng high-traffic'},
    {label: 'Học hỏi liên tục', text: 'Chủ động cập nhật công nghệ mới và áp dụng các phương pháp phát triển hiện đại'},
    {label: 'Sở thích', text: 'Thể thao (bóng đá, chạy bộ), xu hướng công nghệ, system architecture'}
  ],
  timeline: [
    {
      period: '08/2014 - 12/2018',
      org: 'Trường Đại học Tài nguyên và Môi trường TP.HCM',
      kind: 'education',
      major: 'Công nghệ Thông tin',
      degree: 'Kỹ sư',
      achievements: []
    },
    {
      period: '08/2018 - 07/2019',
      org: 'Applancer JSC - Onsite tại Báo Tuổi Trẻ',
      kind: 'work',
      position: 'Web Developer',
      technologies: 'PHP, Yii2 Framework, MySQL, Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor',
      achievements: [
        'Duy trì và cải tiến các backend component của các nền tảng web đang chạy production',
        'Trực tiếp tham gia phát triển tính năng cho các website high-traffic trong môi trường production',
        'Tham gia quy trình development và deployment trên môi trường Linux và containerized'
      ]
    },
    {
      period: '07/2019 - 08/2022',
      org: 'Báo Tuổi Trẻ',
      kind: 'work',
      position: 'Software Development Engineer',
      technologies:
        'PHP, Python, Yii2 Framework, Django Rest Framework, MySQL, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry',
      achievements: [
        'Duy trì và phát triển các hệ thống backend cho các nền tảng tin tức high-traffic trong môi trường production',
        'Thiết kế database schema, phát triển backend API và internal tool cho quy trình nội dung và biên tập',
        'Xây dựng các internal package tái sử dụng và backend component dạng module để dễ maintain và phát triển nhanh hơn',
        'Phát triển các công cụ background processing và automation cho việc đồng bộ, chuyển đổi và tổng hợp dữ liệu',
        'Triển khai và vận hành production deployment, cấu hình service, monitoring và logging để đảm bảo reliability của hệ thống',
        'Nghiên cứu và triển khai giải pháp xác thực Single Sign-On (SSO) cho nhiều nền tảng'
      ]
    },
    {
      period: '08/2022 - Nay',
      org: 'FireGroup Technology',
      kind: 'work',
      position: 'Senior Backend Software Engineer',
      technologies:
        'PHP, Python, Node.js, Laravel Framework, NestJS, MySQL, Redis, RabbitMQ, Kafka, GitLab, Linux, Docker, Kubernetes, Supervisor, Sentry, Rancher',
      thirdParties: 'Shopify, Jira, Segment, CustomerIO, Crisp Chat',
      achievements: [
        'Thiết kế và phát triển backend service và hệ thống background processing cho các ứng dụng trên Shopify, tập trung vào performance và reliability',
        'Thiết kế database schema và các core backend component, đóng góp vào technical planning và các quyết định triển khai',
        'Làm chủ và duy trì backend của các Shopify app, đảm bảo stability, scalability và cung cấp dịch vụ liên tục',
        'Tích hợp third-party platform và internal service để mở rộng năng lực sản phẩm và tối ưu business workflow',
        'Phối hợp với team DevOps cấu hình Kubernetes deployment và tích hợp monitoring, observability cho các backend service',
        'Sử dụng các công cụ AI-assisted development cho code generation, debugging và nâng cao năng suất hằng ngày'
      ]
    }
  ],
  projects: [
    {name: 'OneMobile ‑ Mobile App Builder', image: '/images/projects/om.webp', alt: 'OneMobile', url: 'https://onemobile.ai', description: 'Biến cửa hàng của bạn thành mobile app với OneMobile. Phát triển thương hiệu, giảm chi phí quảng cáo và giữ chân khách hàng.', role: 'Backend Software Engineer - Backend service, analytics & reporting, third-party integration.'},
    {name: 'OneLoyalty: Loyalty & Rewards', image: '/images/projects/ol.webp', alt: 'OneLoyalty', url: 'https://oneloyalty.io', description: 'Dễ dàng triển khai chương trình loyalty và referral giúp tăng doanh số, retention rate và lifetime value của khách hàng.', role: 'Backend Software Engineer - Xây dựng core backend system và business logic từ đầu.'},
    {name: 'Transcy: AI Language Translate', image: '/images/projects/tc.webp', alt: 'Transcy', url: 'https://transcy.io', description: 'Dịch ngôn ngữ cửa hàng bằng OpenAI, DeepL, Gemini, Baidu, v.v. Chuyển đổi tiền tệ để bán hàng toàn cầu.', role: 'Backend Software Engineer - Translation service, performance optimization, tích hợp AI provider.'},
    {name: 'Swift SEO Page Speed Optimizer', image: '/images/projects/sw.webp', alt: 'Swift', url: 'https://onecommerce.io/swift', description: 'Dễ dàng cải thiện SEO và page speed. Website xếp hạng cao hơn và tải nhanh hơn sẽ có conversion tốt hơn.', role: 'Backend Software Engineer - Rebuild backend và phát triển các tính năng SEO.'},
    {name: 'FireGroup - OneExpert Internal Tools & Systems', image: '/images/projects/fg.webp', alt: 'FireGroup Internal', description: 'Nền tảng internal backend giúp các team CS, TS và Expert cung cấp Expert service trên các ứng dụng của FireGroup.', role: 'Backend Software Engineer - Thiết kế và xây dựng các hệ thống internal backend, tích hợp với các sản phẩm FireGroup.'},
    {name: 'SSO Tuoitre Authentication System', image: '/images/projects/tt.webp', alt: 'SSO Tuoitre', url: 'https://sso.tuoitre.vn', description: 'Nền tảng Single Sign-On tập trung cho các dịch vụ số của Tuổi Trẻ.', role: 'Software Development Engineer - Thiết kế và triển khai kiến trúc SSO, authentication flow và các cơ chế security.'},
    {name: 'Tuoi Tre Rao Vat', image: '/images/projects/ttrv.webp', alt: 'Tuoi Tre Rao Vat', url: 'https://raovat.tuoitre.vn', description: 'Nền tảng marketplace trực tuyến do Báo Tuổi Trẻ vận hành.', role: 'Software Development Engineer - Duy trì các tính năng backend hiện có và phát triển chức năng mới.'},
    {name: 'Tuoi Tre Cuoi', image: '/images/projects/ttc.webp', alt: 'Tuoi Tre Cuoi', url: 'https://cuoi.tuoitre.vn', description: 'Nền tảng nội dung hài hước và trào phúng thuộc Báo Tuổi Trẻ.', role: 'Software Development Engineer - Phát triển và duy trì các tính năng backend quản lý nội dung và bình luận.'},
    {name: 'Tuoi Tre News', image: '/images/projects/ttn.webp', alt: 'Tuoi Tre News', url: 'https://news.tuoitre.vn', description: 'Website tin tức tiếng Anh của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Duy trì và cải tiến các tính năng backend phục vụ content delivery.'},
    {name: 'Tuoi Tre Internal Tools', image: '/images/projects/tt.webp', alt: 'Tuoi Tre Internal', description: 'Các hệ thống nội bộ hỗ trợ quy trình tòa soạn và vận hành.', role: 'Software Development Engineer - Xây dựng internal tool từ đầu và migrate các hệ thống legacy sang kiến trúc backend hiện đại.'}
  ],
  contact: [
    {label: 'Họ tên', value: 'Nguyễn Quốc Đại'},
    {label: 'Điện thoại', value: '+84969-113-505', href: 'tel:+84969113505'},
    {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
    {label: 'Kinh nghiệm', value: 'Hơn 6 năm web development'},
    {label: 'Vị trí', value: 'Senior Backend Software Engineer'},
    {label: 'Ngày sinh', value: '27/10/1996'},
    {label: 'Địa chỉ', value: 'Xã Mỹ Chánh, Huyện Phù Mỹ, Tỉnh Bình Định'}
  ]
}
