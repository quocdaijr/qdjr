import type {ProfileContent} from './profile'
import {PROFILE_EN} from './profile.en'

// Vietnamese copy, in the voice Vietnamese developers actually write: job
// titles, project names, stacks and everyday dev words (build, maintain,
// deploy, traffic, feature…) stay in English; the rest is plain Vietnamese
// (titles and stacks pinned by test/profile.spec.ts).
export const PROFILE_VI: ProfileContent = {
  profile: {
    name: 'Nguyễn Quốc Đại',
    displayName: 'Nguyễn Quốc Đại',
    role: 'Senior Backend Software Engineer',
    photo: '/profile.jpg',
    photoAlt: 'Nguyễn Quốc Đại - Senior Backend Software Engineer',
    summary:
      'Backend Software Engineer với hơn 6 năm build và vận hành hệ thống backend high-performance cho các nền tảng báo chí và e-commerce. Mạnh về system design, tối ưu performance, background job và tích hợp third-party. Đã trực tiếp lo và vận hành nhiều hệ thống production quy mô lớn.'
  },
  quote: {text: 'Giải quyết vấn đề trước, rồi mới viết code', author: 'John Johnson'},
  // Skill groups and stacks are technical terms: identical to English.
  skills: PROFILE_EN.skills,
  otherSkills: [
    {label: 'Vận hành production', text: 'Có kinh nghiệm observability, monitoring và xử lý incident trên production'},
    {label: 'Teamwork', text: 'Giao tiếp tốt, chủ động share kiến thức kỹ thuật khi làm việc với nhiều team'},
    {label: 'Problem solving', text: 'Phân tích và debug tốt các hệ thống phức tạp, thiết kế giải pháp dễ scale cho ứng dụng traffic lớn'},
    {label: 'Tự học', text: 'Luôn cập nhật công nghệ mới và áp dụng best practice vào công việc'},
    {label: 'Sở thích', text: 'Bóng đá, chạy bộ, công nghệ và system architecture'}
  ],
  timeline: [
    {
      period: '08/2014 - 12/2018',
      org: 'Trường Đại học Tài nguyên và Môi trường TP.HCM',
      short: 'HCMUNRE',
      kind: 'education',
      major: 'Công nghệ Thông tin',
      degree: 'Kỹ sư',
      achievements: []
    },
    {
      period: '08/2018 - 07/2019',
      org: 'Applancer JSC - Onsite tại Báo Tuổi Trẻ',
      short: 'Applancer',
      kind: 'work',
      position: 'Web Developer',
      technologies: 'PHP, Yii2 Framework, MySQL, Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor',
      achievements: [
        'Maintain và cải tiến backend của các hệ thống web đang chạy production',
        'Trực tiếp phát triển feature cho các website traffic lớn',
        'Tham gia develop và deploy trên môi trường Linux, Docker'
      ]
    },
    {
      period: '07/2019 - 08/2022',
      org: 'Báo Tuổi Trẻ',
      short: 'Tuổi Trẻ',
      kind: 'work',
      position: 'Software Development Engineer',
      technologies:
        'PHP, Python, Yii2 Framework, Django Rest Framework, MySQL, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry',
      achievements: [
        'Maintain và phát triển backend cho các trang tin tức traffic lớn',
        'Thiết kế database schema, build API và các tool nội bộ cho quy trình biên tập nội dung',
        'Build các package, module backend dùng chung để code dễ maintain và phát triển nhanh hơn',
        'Viết background job và tool tự động để sync, chuyển đổi và tổng hợp dữ liệu',
        'Trực tiếp deploy và vận hành production: config service, monitoring, logging để hệ thống chạy ổn định',
        'Nghiên cứu và triển khai Single Sign-On (SSO) dùng chung cho nhiều sản phẩm'
      ]
    },
    {
      period: '08/2022 - Nay',
      org: 'FireGroup Technology',
      short: 'FireGroup',
      kind: 'work',
      position: 'Senior Backend Software Engineer',
      technologies:
        'PHP, Python, Node.js, Laravel Framework, NestJS, MySQL, Redis, RabbitMQ, Kafka, GitLab, Linux, Docker, Kubernetes, Supervisor, Sentry, Rancher',
      thirdParties: 'Shopify, Jira, Segment, CustomerIO, Crisp Chat',
      achievements: [
        'Thiết kế và phát triển backend service, hệ thống background job cho các Shopify app, tập trung vào performance và độ ổn định',
        'Thiết kế database schema và các thành phần backend core, tham gia planning và ra quyết định kỹ thuật',
        'Phụ trách backend các Shopify app, đảm bảo hệ thống ổn định, dễ scale và chạy liên tục',
        'Tích hợp third-party và service nội bộ để mở rộng tính năng sản phẩm, tối ưu quy trình vận hành',
        'Phối hợp với team DevOps setup deploy trên Kubernetes, tích hợp monitoring và observability cho các backend service',
        'Dùng AI tool cho việc code, debug và tăng năng suất hằng ngày'
      ]
    }
  ],
  projects: [
    {group: 'FireGroup Technology', name: 'OneMobile ‑ Mobile App Builder', image: '/images/projects/om.webp', alt: 'OneMobile', url: 'https://onemobile.ai', description: 'Biến store thành mobile app với OneMobile: tăng nhận diện thương hiệu, giảm chi phí quảng cáo và giữ chân khách hàng.', role: 'Backend Software Engineer - Phát triển backend service, analytics & reporting và tích hợp third-party.'},
    {group: 'FireGroup Technology', name: 'OneLoyalty: Loyalty & Rewards', image: '/images/projects/ol.webp', alt: 'OneLoyalty', url: 'https://oneloyalty.io', description: 'Triển khai nhanh chương trình khách hàng thân thiết và referral, giúp tăng doanh số, tỷ lệ quay lại và customer lifetime value.', role: 'Backend Software Engineer - Build hệ thống backend và business logic từ đầu.'},
    {group: 'FireGroup Technology', name: 'Transcy: AI Language Translate', image: '/images/projects/tc.webp', alt: 'Transcy', url: 'https://transcy.io', description: 'Dịch store bằng OpenAI, DeepL, Gemini, Baidu… Đổi tiền tệ để bán hàng toàn cầu.', role: 'Backend Software Engineer - Phát triển translation service, tối ưu performance và tích hợp các AI provider.'},
    {group: 'FireGroup Technology', name: 'Swift SEO Page Speed Optimizer', image: '/images/projects/sw.webp', alt: 'Swift', url: 'https://onecommerce.io/swift', description: 'Cải thiện SEO và page speed dễ dàng. Website rank cao, load nhanh thì conversion tốt hơn.', role: 'Backend Software Engineer - Rebuild backend và phát triển các tính năng SEO.'},
    {group: 'FireGroup Technology', name: 'FireGroup - OneExpert Internal Tools & Systems', image: '/images/projects/fg.webp', alt: 'FireGroup Internal', description: 'Nền tảng backend nội bộ giúp các team CS, TS và Expert cung cấp dịch vụ Expert trên các app của FireGroup.', role: 'Backend Software Engineer - Thiết kế và build các hệ thống backend nội bộ, tích hợp với các sản phẩm của FireGroup.'},
    {group: 'Báo Tuổi Trẻ', name: 'SSO Tuoitre Authentication System', image: '/images/projects/tt.webp', alt: 'SSO Tuoitre', url: 'https://sso.tuoitre.vn', description: 'Nền tảng Single Sign-On (SSO) cho các dịch vụ số của Tuổi Trẻ.', role: 'Software Development Engineer - Thiết kế và triển khai kiến trúc SSO, authentication flow và các cơ chế bảo mật.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Rao Vat', image: '/images/projects/ttrv.webp', alt: 'Tuoi Tre Rao Vat', url: 'https://raovat.tuoitre.vn', description: 'Nền tảng rao vặt online của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Maintain feature backend hiện có và phát triển feature mới.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Cuoi', image: '/images/projects/ttc.webp', alt: 'Tuoi Tre Cuoi', url: 'https://cuoi.tuoitre.vn', description: 'Chuyên trang nội dung hài, châm biếm của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Phát triển và maintain backend quản lý nội dung và bình luận.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre News', image: '/images/projects/ttn.webp', alt: 'Tuoi Tre News', url: 'https://news.tuoitre.vn', description: 'Trang tin tiếng Anh của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Maintain và cải tiến backend phục vụ phân phối nội dung.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Internal Tools', image: '/images/projects/tt.webp', alt: 'Tuoi Tre Internal', description: 'Các hệ thống nội bộ phục vụ tòa soạn và vận hành.', role: 'Software Development Engineer - Build tool nội bộ từ đầu và migrate các hệ thống cũ sang kiến trúc backend mới.'}
  ],
  contact: [
    {label: 'Họ tên', value: 'Nguyễn Quốc Đại'},
    {label: 'Điện thoại', value: '+84969-113-505', href: 'tel:+84969113505'},
    {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
    {label: 'Kinh nghiệm', value: 'Hơn 6 năm làm web'},
    {label: 'Vị trí', value: 'Senior Backend Software Engineer'},
    {label: 'Ngày sinh', value: '27/10/1996'},
    {label: 'Địa chỉ', value: 'Xã Mỹ Chánh, Huyện Phù Mỹ, Tỉnh Bình Định'}
  ]
}
