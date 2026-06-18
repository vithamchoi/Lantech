# Lantech English - Tài liệu Tổng quan Dự án

Dự án này là hệ thống Backend cho nền tảng học tiếng Anh trực tuyến, được xây dựng bằng .NET 8, PostgreSQL và Redis theo kiến trúc Clean Architecture.

## 1. Công nghệ sử dụng (Tech Stack)
- **Framework**: .NET 8 Web API
- **Database**: PostgreSQL 16 (ORM: Entity Framework Core)
- **Caching**: Redis 7
- **AI Integration**: OpenRouter (hỗ trợ nhiều model như Gemini, Llama), Groq
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT (Access & Refresh Tokens), Google OAuth

## 2. Kiến trúc dự án (Architecture)
Dự án tuân thủ **Clean Architecture** để đảm bảo tính dễ bảo trì và mở rộng:

- **SWD392.LantechEnglish.Api**: Tầng giao tiếp ngoại vi (Controllers, Middlewares, Configurations).
- **SWD392.LantechEnglish.Application**: Tầng logic nghiệp vụ (Interfaces, DTOs, Application Logic).
- **SWD392.LantechEnglish.Domain**: Tầng cốt lõi (Entities, Enums, Domain Logic), không phụ thuộc vào tầng khác.
- **SWD392.LantechEnglish.Infrastructure**: Tầng triển khai kỹ thuật (Data Access, External Services - AI, Cache, Auth).

## 3. Cấu trúc thư mục Quan trọng
```text
backend/src/
├── SWD392.LantechEnglish.Api/
│   ├── Controllers/             # Điểm tiếp nhận request từ Client
│   └── Middlewares/             # Xử lý lỗi tập trung và Logging
├── SWD392.LantechEnglish.Application/
│   ├── DTOs/                    # Cấu trúc dữ liệu truyền tải (Request/Response)
│   └── Interfaces/              # Định nghĩa các bản thiết kế dịch vụ
├── SWD392.LantechEnglish.Domain/
│   └── Entities/                # Các thực thể database (User, Lesson, Assessment...)
└── SWD392.LantechEnglish.Infrastructure/
    ├── Data/                    # DbContext và Cấu hình Entity Framework
    ├── Services/                # Triển khai logic thực tế của các dịch vụ
    └── Services/AIProviders/    # Hệ thống tích hợp AI linh hoạt (OpenRouter, Groq)
```

## 4. Các Module chính & Luồng hoạt động

### A. Hệ thống Đánh giá (Assessment System)
- Thực hiện bài kiểm tra đầu vào 4 kỹ năng (Nghe, Nói, Đọc, Viết).
- Sử dụng AI để tạo câu hỏi động và chấm điểm tự động (đặc biệt là kỹ năng Viết và Nói).
- Xếp hạng trình độ theo chuẩn CEFR (A1-C1).

### B. Lộ trình học tập (Learning Path)
- AI phân tích điểm yếu từ kết quả kiểm tra để tạo Roadmap cá nhân hóa.
- Quản lý bài học (`Lessons`) và bài tập (`Exercises`) theo cấp độ.

### C. Hệ thống AI (AI Integration)
- Cơ chế **Factory & Fallback**: Nếu model AI chính lỗi, hệ thống tự động chuyển sang model dự phòng (ví dụ: từ Gemini sang Llama).
- Hỗ trợ giải thích ngữ pháp, tạo ví dụ từ vựng và chấm điểm nói/viết.

### D. Gamification (Trò chơi hóa)
- Theo dõi XP, Streak (chuỗi ngày học) và trao tặng Badge (Huy hiệu).
- Bảng xếp hạng (Leaderboard) toàn cầu hoặc theo tuần/tháng.

### E. Flashcards (Thẻ ghi nhớ)
- Sử dụng phương pháp lặp lại ngắt quãng (Spaced Repetition) để tối ưu việc nhớ từ vựng.

## 5. Hướng dẫn Phát triển
- **Cấu hình**: Chỉnh sửa file `.env` ở thư mục `backend/` cho các API Key và Connection String.
- **Database**: Sử dụng Docker Compose để chạy Postgres và Redis.
- **Migrations**: 
  ```bash
  dotnet ef database update --project src/SWD392.LantechEnglish.Infrastructure --startup-project src/SWD392.LantechEnglish.Api
  ```
- **Seeding**: Dữ liệu mẫu (Ngôn ngữ, Bài học, Huy hiệu) được tự động khởi tạo khi chạy ứng dụng thông qua `DbSeeder`.

## 6. Các file quan trọng cần lưu ý
- `Program.cs`: Cấu hình khởi tạo hệ thống.
- `AppDbContext.cs`: Định nghĩa cấu trúc bảng dữ liệu.
- `DependencyInjection.cs`: Nơi đăng ký các dịch vụ vào hệ thống.
- `.env`: Chứa các thông tin bảo mật quan trọng.
