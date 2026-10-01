import type {ProfileContent} from './profile'

export const PROFILE_VI: ProfileContent = {
  profile: {
    name: 'Nguyễn Quốc Đại',
    displayName: 'Nguyễn Quốc Đại',
    role: 'Kỹ sư Phần mềm Backend Cấp cao',
    photo: '/profile.jpg',
    photoAlt: 'Nguyễn Quốc Đại - Ảnh hồ sơ Kỹ sư Phần mềm Backend Cấp cao',
    summary:
      'Kỹ sư Phần mềm Backend với hơn 6 năm kinh nghiệm xây dựng và vận hành các hệ thống backend hiệu năng cao cho nền tảng truyền thông và thương mại điện tử. Thế mạnh về thiết kế hệ thống, tối ưu hiệu năng, xử lý tác vụ nền và tích hợp bên thứ ba. Có kinh nghiệm làm chủ và vận hành các hệ thống production ở quy mô lớn.'
  },
  quote: {text: 'Trước tiên, hãy giải quyết vấn đề. Sau đó, hãy viết code', author: 'John Johnson'},
  skills: [
    {group: 'Ngôn ngữ lập trình', expert: 'PHP (Yii2, Laravel)', proficient: 'Node.js (NestJS, AdonisJS), Python, JavaScript'},
    {group: 'Cơ sở dữ liệu & Lưu trữ', expert: 'MySQL, Redis, Elasticsearch', proficient: 'MongoDB, tối ưu cơ sở dữ liệu, tinh chỉnh hiệu năng truy vấn'},
    {group: 'Hàng đợi & Luồng dữ liệu', expert: 'RabbitMQ', proficient: 'Kafka'},
    {group: 'DevOps & Hạ tầng', expert: 'Linux, Docker, Nginx, Git, Supervisor', proficient: 'Kubernetes, CI/CD Pipelines, AWS'},
    {group: 'Công nghệ Frontend', proficient: 'Vue.js, Nuxt.js, HTML5, CSS3, Tailwind CSS'},
    {
      group: 'Tích hợp bên thứ ba',
      note: 'Shopify, nền tảng thương mại điện tử, cổng thanh toán, dịch vụ phân tích và theo dõi, công cụ chăm sóc khách hàng, hệ thống giao tiếp thời gian thực, nền tảng quản lý dự án, công cụ kiểm thử API'
    }
  ],
  otherSkills: [
    {label: 'Sẵn sàng cho production', text: 'Có kinh nghiệm về khả năng quan sát hệ thống, giám sát và xử lý sự cố trong môi trường production'},
    {label: 'Làm việc nhóm', text: 'Giao tiếp tốt và chia sẻ kiến thức kỹ thuật giữa các nhóm liên chức năng'},
    {label: 'Giải quyết vấn đề', text: 'Khả năng phân tích tốt khi gỡ lỗi các hệ thống phức tạp và thiết kế giải pháp mở rộng cho ứng dụng lưu lượng cao'},
    {label: 'Học hỏi liên tục', text: 'Chủ động cập nhật công nghệ mới và áp dụng các phương pháp phát triển hiện đại'},
    {label: 'Sở thích', text: 'Thể thao (bóng đá, chạy bộ), xu hướng công nghệ, kiến trúc hệ thống'}
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
      position: 'Lập trình viên Web',
      technologies: 'PHP, Yii2 Framework, MySQL, Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor',
      achievements: [
        'Duy trì và cải tiến các thành phần backend của các nền tảng web đang vận hành',
        'Trực tiếp tham gia phát triển tính năng cho các website lưu lượng cao trong môi trường production',
        'Tham gia quy trình phát triển và triển khai trên môi trường Linux và container'
      ]
    },
    {
      period: '07/2019 - 08/2022',
      org: 'Báo Tuổi Trẻ',
      kind: 'work',
      position: 'Kỹ sư Phát triển Phần mềm',
      technologies:
        'PHP, Python, Yii2 Framework, Django Rest Framework, MySQL, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry',
      achievements: [
        'Duy trì và phát triển hệ thống backend cho các nền tảng tin tức lưu lượng cao trong môi trường production',
        'Thiết kế lược đồ cơ sở dữ liệu, phát triển API backend và công cụ nội bộ cho quy trình nội dung và biên tập',
        'Xây dựng các package nội bộ tái sử dụng và thành phần backend dạng module để tăng khả năng bảo trì và hiệu quả phát triển',
        'Phát triển công cụ xử lý nền và tự động hóa cho việc đồng bộ, chuyển đổi và tổng hợp dữ liệu',
        'Triển khai và vận hành production: cấu hình dịch vụ, giám sát và ghi log để đảm bảo độ tin cậy của hệ thống',
        'Nghiên cứu và triển khai giải pháp xác thực Single Sign-On (SSO) cho nhiều nền tảng'
      ]
    },
    {
      period: '08/2022 - Nay',
      org: 'FireGroup Technology',
      kind: 'work',
      position: 'Kỹ sư Phần mềm Backend Cấp cao',
      technologies:
        'PHP, Python, Node.js, Laravel Framework, NestJS, MySQL, Redis, RabbitMQ, Kafka, GitLab, Linux, Docker, Kubernetes, Supervisor, Sentry, Rancher',
      thirdParties: 'Shopify, Jira, Segment, CustomerIO, Crisp Chat',
      achievements: [
        'Thiết kế và phát triển dịch vụ backend và hệ thống xử lý nền cho các ứng dụng trên Shopify, tập trung vào hiệu năng và độ tin cậy',
        'Thiết kế lược đồ cơ sở dữ liệu và các thành phần backend cốt lõi, đóng góp vào kế hoạch kỹ thuật và quyết định triển khai',
        'Làm chủ và duy trì backend của các ứng dụng Shopify, đảm bảo tính ổn định, khả năng mở rộng và dịch vụ liên tục',
        'Tích hợp nền tảng bên thứ ba và dịch vụ nội bộ để mở rộng năng lực sản phẩm và tối ưu quy trình nghiệp vụ',
        'Phối hợp với đội DevOps cấu hình triển khai Kubernetes và tích hợp giám sát, khả năng quan sát cho các dịch vụ backend',
        'Sử dụng công cụ hỗ trợ lập trình bằng AI để sinh code, gỡ lỗi và nâng cao năng suất hằng ngày'
      ]
    }
  ],
  projects: [
    {name: 'OneMobile ‑ Mobile App Builder', image: '/images/projects/om.webp', alt: 'OneMobile', url: 'https://onemobile.ai', description: 'Biến cửa hàng của bạn thành ứng dụng di động với OneMobile. Phát triển thương hiệu, giảm chi phí quảng cáo và giữ chân khách hàng.', role: 'Kỹ sư Phần mềm Backend - Dịch vụ backend, phân tích và báo cáo, tích hợp bên thứ ba.'},
    {name: 'OneLoyalty: Loyalty & Rewards', image: '/images/projects/ol.webp', alt: 'OneLoyalty', url: 'https://oneloyalty.io', description: 'Dễ dàng triển khai chương trình khách hàng thân thiết và giới thiệu, giúp tăng doanh số, tỷ lệ giữ chân và giá trị vòng đời khách hàng.', role: 'Kỹ sư Phần mềm Backend - Xây dựng hệ thống backend cốt lõi và logic nghiệp vụ từ đầu.'},
    {name: 'Transcy: AI Language Translate', image: '/images/projects/tc.webp', alt: 'Transcy', url: 'https://transcy.io', description: 'Dịch ngôn ngữ cửa hàng bằng OpenAI, DeepL, Gemini, Baidu, v.v. Chuyển đổi tiền tệ để bán hàng toàn cầu.', role: 'Kỹ sư Phần mềm Backend - Dịch vụ dịch thuật, tối ưu hiệu năng, tích hợp các nhà cung cấp AI.'},
    {name: 'Swift SEO Page Speed Optimizer', image: '/images/projects/sw.webp', alt: 'Swift', url: 'https://onecommerce.io/swift', description: 'Dễ dàng cải thiện SEO và tốc độ trang. Website xếp hạng cao hơn và tải nhanh hơn sẽ chuyển đổi tốt hơn.', role: 'Kỹ sư Phần mềm Backend - Xây dựng lại backend và phát triển tính năng SEO.'},
    {name: 'FireGroup - Hệ thống & Công cụ nội bộ OneExpert', image: '/images/projects/fg.webp', alt: 'FireGroup nội bộ', description: 'Nền tảng backend nội bộ giúp các đội CS, TS và Expert cung cấp dịch vụ Expert trên các ứng dụng của FireGroup.', role: 'Kỹ sư Phần mềm Backend - Thiết kế và xây dựng hệ thống backend nội bộ, tích hợp với các sản phẩm FireGroup.'},
    {name: 'Hệ thống xác thực SSO Tuổi Trẻ', image: '/images/projects/tt.webp', alt: 'SSO Tuổi Trẻ', url: 'https://sso.tuoitre.vn', description: 'Nền tảng đăng nhập một lần tập trung cho các dịch vụ số của Tuổi Trẻ.', role: 'Kỹ sư Phát triển Phần mềm - Thiết kế và triển khai kiến trúc SSO, luồng xác thực và cơ chế bảo mật.'},
    {name: 'Tuổi Trẻ Rao Vặt', image: '/images/projects/ttrv.webp', alt: 'Tuổi Trẻ Rao Vặt', url: 'https://raovat.tuoitre.vn', description: 'Nền tảng rao vặt trực tuyến do Báo Tuổi Trẻ vận hành.', role: 'Kỹ sư Phát triển Phần mềm - Duy trì tính năng backend hiện có và phát triển chức năng mới.'},
    {name: 'Tuổi Trẻ Cười', image: '/images/projects/ttc.webp', alt: 'Tuổi Trẻ Cười', url: 'https://cuoi.tuoitre.vn', description: 'Nền tảng nội dung hài hước và trào phúng thuộc Báo Tuổi Trẻ.', role: 'Kỹ sư Phát triển Phần mềm - Phát triển và duy trì tính năng backend quản lý nội dung và bình luận.'},
    {name: 'Tuổi Trẻ News', image: '/images/projects/ttn.webp', alt: 'Tuổi Trẻ News', url: 'https://news.tuoitre.vn', description: 'Trang tin tức tiếng Anh của Báo Tuổi Trẻ.', role: 'Kỹ sư Phát triển Phần mềm - Duy trì và cải tiến tính năng backend phục vụ phân phối nội dung.'},
    {name: 'Công cụ nội bộ Tuổi Trẻ', image: '/images/projects/tt.webp', alt: 'Tuổi Trẻ nội bộ', description: 'Các hệ thống nội bộ hỗ trợ quy trình tòa soạn và vận hành.', role: 'Kỹ sư Phát triển Phần mềm - Xây dựng công cụ nội bộ từ đầu và chuyển đổi hệ thống cũ sang kiến trúc backend hiện đại.'}
  ],
  contact: [
    {label: 'Họ tên', value: 'Nguyễn Quốc Đại'},
    {label: 'Điện thoại', value: '+84969-113-505', href: 'tel:+84969113505'},
    {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
    {label: 'Kinh nghiệm', value: 'Hơn 6 năm phát triển web'},
    {label: 'Vị trí', value: 'Kỹ sư Phần mềm Backend Cấp cao'},
    {label: 'Ngày sinh', value: '27/10/1996'},
    {label: 'Địa chỉ', value: 'Xã Mỹ Chánh, Huyện Phù Mỹ, Tỉnh Bình Định'}
  ]
}
