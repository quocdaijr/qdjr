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
      'Backend Software Engineer với hơn 6 năm kinh nghiệm xây dựng và vận hành hệ thống backend hiệu năng cao cho các nền tảng báo chí và thương mại điện tử. Thế mạnh về system design, tối ưu performance, xử lý background job và tích hợp third-party. Đã trực tiếp phụ trách và vận hành nhiều hệ thống production quy mô lớn.'
  },
  quote: {text: 'Trước tiên, hãy giải quyết vấn đề. Sau đó, hãy viết code', author: 'John Johnson'},
  // Skill groups and stacks are technical terms: identical to English.
  skills: PROFILE_EN.skills,
  otherSkills: [
    {label: 'Vận hành production', text: 'Có kinh nghiệm về observability, monitoring và xử lý sự cố cho hệ thống production'},
    {label: 'Làm việc nhóm', text: 'Giao tiếp tốt, chủ động chia sẻ kiến thức kỹ thuật khi làm việc với nhiều team'},
    {label: 'Giải quyết vấn đề', text: 'Phân tích và debug tốt các hệ thống phức tạp, thiết kế giải pháp dễ mở rộng cho ứng dụng có lượng truy cập lớn'},
    {label: 'Học hỏi', text: 'Luôn cập nhật công nghệ mới và áp dụng các best practice vào công việc'},
    {label: 'Sở thích', text: 'Bóng đá, chạy bộ, công nghệ và system architecture'}
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
        'Bảo trì và cải tiến phần backend của các hệ thống web đang chạy production',
        'Trực tiếp phát triển tính năng cho các website có lượng truy cập lớn',
        'Tham gia phát triển và deploy trên môi trường Linux và Docker'
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
        'Bảo trì và phát triển hệ thống backend cho các trang tin tức có lượng truy cập lớn',
        'Thiết kế database schema, xây dựng API và các công cụ nội bộ phục vụ quy trình biên tập nội dung',
        'Xây dựng các package và module backend dùng chung, giúp code dễ bảo trì và phát triển nhanh hơn',
        'Viết các background job và công cụ tự động để đồng bộ, chuyển đổi và tổng hợp dữ liệu',
        'Trực tiếp deploy và vận hành production: cấu hình service, monitoring và logging để hệ thống chạy ổn định',
        'Nghiên cứu và triển khai giải pháp Single Sign-On (SSO) dùng chung cho nhiều sản phẩm'
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
        'Thiết kế và phát triển backend service, hệ thống background job cho các Shopify app, tập trung vào performance và độ ổn định',
        'Thiết kế database schema và các thành phần backend cốt lõi, tham gia lên kế hoạch và ra quyết định kỹ thuật',
        'Phụ trách backend của các Shopify app, đảm bảo hệ thống ổn định, dễ mở rộng và hoạt động liên tục',
        'Tích hợp các nền tảng third-party và service nội bộ để mở rộng tính năng sản phẩm, tối ưu quy trình vận hành',
        'Phối hợp với team DevOps cấu hình deploy trên Kubernetes, tích hợp monitoring và observability cho các backend service',
        'Ứng dụng công cụ AI vào việc viết code, debug và nâng cao năng suất hằng ngày'
      ]
    }
  ],
  projects: [
    {group: 'FireGroup Technology', name: 'OneMobile ‑ Mobile App Builder', image: '/images/projects/om.webp', alt: 'OneMobile', url: 'https://onemobile.ai', description: 'Biến cửa hàng của bạn thành mobile app với OneMobile: tăng nhận diện thương hiệu, giảm chi phí quảng cáo và giữ chân khách hàng.', role: 'Backend Software Engineer - Phát triển backend service, analytics & reporting và tích hợp third-party.'},
    {group: 'FireGroup Technology', name: 'OneLoyalty: Loyalty & Rewards', image: '/images/projects/ol.webp', alt: 'OneLoyalty', url: 'https://oneloyalty.io', description: 'Dễ dàng triển khai chương trình khách hàng thân thiết và giới thiệu, giúp tăng doanh số, tỷ lệ quay lại và giá trị vòng đời khách hàng.', role: 'Backend Software Engineer - Xây dựng hệ thống backend và business logic từ đầu.'},
    {group: 'FireGroup Technology', name: 'Transcy: AI Language Translate', image: '/images/projects/tc.webp', alt: 'Transcy', url: 'https://transcy.io', description: 'Dịch ngôn ngữ cửa hàng bằng OpenAI, DeepL, Gemini, Baidu, v.v. Chuyển đổi tiền tệ để bán hàng toàn cầu.', role: 'Backend Software Engineer - Phát triển translation service, tối ưu performance và tích hợp các AI provider.'},
    {group: 'FireGroup Technology', name: 'Swift SEO Page Speed Optimizer', image: '/images/projects/sw.webp', alt: 'Swift', url: 'https://onecommerce.io/swift', description: 'Dễ dàng cải thiện SEO và tốc độ tải trang. Website xếp hạng cao và tải nhanh sẽ có tỷ lệ chuyển đổi tốt hơn.', role: 'Backend Software Engineer - Xây dựng lại backend và phát triển các tính năng SEO.'},
    {group: 'FireGroup Technology', name: 'FireGroup - OneExpert Internal Tools & Systems', image: '/images/projects/fg.webp', alt: 'FireGroup Internal', description: 'Nền tảng backend nội bộ giúp các team CS, TS và Expert cung cấp dịch vụ Expert trên các ứng dụng của FireGroup.', role: 'Backend Software Engineer - Thiết kế và xây dựng các hệ thống backend nội bộ, tích hợp với các sản phẩm của FireGroup.'},
    {group: 'Báo Tuổi Trẻ', name: 'SSO Tuoitre Authentication System', image: '/images/projects/tt.webp', alt: 'SSO Tuoitre', url: 'https://sso.tuoitre.vn', description: 'Nền tảng đăng nhập một lần (SSO) cho các dịch vụ số của Tuổi Trẻ.', role: 'Software Development Engineer - Thiết kế và triển khai kiến trúc SSO, luồng xác thực và các cơ chế bảo mật.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Rao Vat', image: '/images/projects/ttrv.webp', alt: 'Tuoi Tre Rao Vat', url: 'https://raovat.tuoitre.vn', description: 'Nền tảng rao vặt trực tuyến của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Bảo trì các tính năng backend hiện có và phát triển tính năng mới.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Cuoi', image: '/images/projects/ttc.webp', alt: 'Tuoi Tre Cuoi', url: 'https://cuoi.tuoitre.vn', description: 'Chuyên trang nội dung hài hước, trào phúng của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Phát triển và bảo trì các tính năng backend quản lý nội dung và bình luận.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre News', image: '/images/projects/ttn.webp', alt: 'Tuoi Tre News', url: 'https://news.tuoitre.vn', description: 'Trang tin tức tiếng Anh của Báo Tuổi Trẻ.', role: 'Software Development Engineer - Bảo trì và cải tiến các tính năng backend phục vụ phân phối nội dung.'},
    {group: 'Báo Tuổi Trẻ', name: 'Tuoi Tre Internal Tools', image: '/images/projects/tt.webp', alt: 'Tuoi Tre Internal', description: 'Các hệ thống nội bộ phục vụ tòa soạn và vận hành.', role: 'Software Development Engineer - Xây dựng công cụ nội bộ từ đầu và chuyển các hệ thống cũ sang kiến trúc backend hiện đại.'}
  ],
  contact: [
    {label: 'Họ tên', value: 'Nguyễn Quốc Đại'},
    {label: 'Điện thoại', value: '+84969-113-505', href: 'tel:+84969113505'},
    {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
    {label: 'Kinh nghiệm', value: 'Hơn 6 năm phát triển web'},
    {label: 'Vị trí', value: 'Senior Backend Software Engineer'},
    {label: 'Ngày sinh', value: '27/10/1996'},
    {label: 'Địa chỉ', value: 'Xã Mỹ Chánh, Huyện Phù Mỹ, Tỉnh Bình Định'}
  ]
}
