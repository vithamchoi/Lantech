# Lantech English - Backend API

English learning platform backend built with .NET 8, PostgreSQL, and Clean Architecture.

## Project Structure

```
backend/
├── src/
│   ├── SWD392.LantechEnglish.Api/          # Web API layer
│   ├── SWD392.LantechEnglish.Application/  # Business logic layer
│   ├── SWD392.LantechEnglish.Domain/       # Domain entities and enums
│   └── SWD392.LantechEnglish.Infrastructure/ # Data access and external services
├── docker-compose.yml                       # PostgreSQL and Redis containers
└── README.md

## Current Progress

### ✅ Completed

**Phase 1: Project Setup (Partial)**
- Created .NET solution with 4 projects (Api, Application, Domain, Infrastructure)
- Added project references and NuGet packages
- Configured Program.cs with basic setup
- Solution builds successfully

**Phase 2: Domain & Database (Partial)**
- Created all 11 domain enums:
  - UserRole, UserStatus, CefrLevel, SkillType, ExerciseType
  - ProgressStatus, AssessmentStatus, LevelSource, AIProviderType
  - PronunciationProvider, ContentSource
  
- Created all 22 domain entities:
  - User, UserSkillProfile, Language, RefreshToken
  - Assessment, AssessmentSection, AssessmentQuestion, AssessmentAnswer
  - LearningPath, Lesson, Exercise, LessonProgress, ExerciseAttempt
  - Vocabulary, VocabularyTranslation, Flashcard, FlashcardReview
  - PronunciationAttempt, Badge, UserBadge, XpTransaction, StudySession

- Created AppDbContext with all DbSets
- Created 4 key EF Core configurations:
  - UserConfiguration (Email unique index, Role/Status indexes)
  - RefreshTokenConfiguration (TokenHash unique index)
  - LanguageConfiguration (Code unique index)
  - BadgeConfiguration (Code unique index)

- Created docker-compose.yml with PostgreSQL 16 and Redis 7
- Created appsettings.Development.json with connection strings and configuration
- Created initial EF Core migration: `20260602010740_InitialCreate`

### 🚧 In Progress / Next Steps

**Phase 1: Complete Project Setup**
- Add Serilog for structured logging
- Enhance Swagger with grouping, descriptions, and JWT auth UI
- Add CORS configuration
- Add global exception handling middleware
- Add request/response logging middleware
- Create standard API response wrapper

**Phase 2: Complete Database Setup**
- Start Docker containers
- Apply EF Core migration to create database schema
- Create seed data for:
  - Languages (vi, ja, ko, zh, en)
  - Admin and test users
  - Sample assessment questions (A1-A2 level)
  - Sample lessons and exercises
  - Sample vocabulary with translations
  - Badges
- Add remaining EF Core entity configurations (18 more)

**Phase 3-12: Feature Implementation**
- Authentication & Authorization (JWT, refresh tokens, password hashing)
- User APIs (profile, language selection, study summary)
- Assessment System (4-skill English test, CEFR calculation)
- Learning Content (lessons, exercises, vocabulary, flashcards)
- AI Provider System (Mock, OpenRouter, optional Gemini/Claude/OpenAI)
- Pronunciation System (MVP with text similarity)
- Gamification (XP, streaks, badges, leaderboard)
- Admin APIs (CRUD for all content)
- Frontend Testing UI (React + Vite)
- Final Polish

## Prerequisites

- .NET SDK 8.0 or later
- Docker Desktop
- PostgreSQL client (optional, for manual DB access)

## Getting Started

### 1. Start Infrastructure

```bash
cd backend
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
  - Database: `lantech_english`
  - User: `postgres`
  - Password: `postgres`
- Redis on `localhost:6379`

### 2. Apply Database Migration

```bash
dotnet ef database update --project src/SWD392.LantechEnglish.Infrastructure --startup-project src/SWD392.LantechEnglish.Api
```

### 3. Run the API

```bash
dotnet run --project src/SWD392.LantechEnglish.Api
```

The API will start on `http://localhost:5000`

### 4. Access Swagger

Open `http://localhost:5000/swagger` in your browser.

## Project Commands

### Build Solution
```bash
dotnet build
```

### Create New Migration
```bash
dotnet ef migrations add <MigrationName> --project src/SWD392.LantechEnglish.Infrastructure --startup-project src/SWD392.LantechEnglish.Api
```

### Apply Migrations
```bash
dotnet ef database update --project src/SWD392.LantechEnglish.Infrastructure --startup-project src/SWD392.LantechEnglish.Api
```

### Remove Last Migration
```bash
dotnet ef migrations remove --project src/SWD392.LantechEnglish.Infrastructure --startup-project src/SWD392.LantechEnglish.Api
```

### Stop Docker Containers
```bash
docker compose down
```

### Stop Docker and Remove Volumes
```bash
docker compose down -v
```

## Configuration

Configuration is managed through `appsettings.Development.json`:

- **ConnectionStrings**: PostgreSQL and Redis connection strings
- **Jwt**: JWT token settings (secrets should be changed in production)
- **Cors**: Allowed origins for CORS
- **AI**: AI provider configuration (currently set to Mock)
- **AzureSpeech**: Azure Speech service configuration (optional)
- **Storage**: File upload configuration

## Architecture

The project follows Clean Architecture principles:

- **Domain**: Core business entities and enums, no dependencies
- **Application**: Business logic, DTOs, interfaces, depends on Domain
- **Infrastructure**: Data access, external services, depends on Application and Domain
- **Api**: Web API controllers, middleware, configuration, depends on all layers

## Technology Stack

- **.NET 8**: Web API framework
- **Entity Framework Core 10**: ORM for PostgreSQL
- **Npgsql**: PostgreSQL provider
- **Swagger/Swashbuckle**: API documentation
- **Docker**: Container platform for PostgreSQL and Redis

## Entities Overview

### User Management
- **User**: User accounts with roles, auth, and learning profile
- **UserSkillProfile**: CEFR skill levels (Listening, Speaking, Reading, Writing)
- **Language**: Supported languages for learning and UI
- **RefreshToken**: JWT refresh token storage

### Assessment System
- **Assessment**: Four-skill English proficiency tests
- **AssessmentSection**: Individual skill sections within an assessment
- **AssessmentQuestion**: Question bank for assessments
- **AssessmentAnswer**: User answers and scores

### Learning Content
- **LearningPath**: Personalized learning paths based on user level
- **Lesson**: Structured learning units
- **Exercise**: Practice activities within lessons
- **LessonProgress**: User progress tracking for lessons
- **ExerciseAttempt**: User exercise submissions and scores

### Vocabulary System
- **Vocabulary**: English words and phrases
- **VocabularyTranslation**: Translations in different languages
- **Flashcard**: Spaced repetition flashcards
- **FlashcardReview**: SM-2 algorithm review history

### Pronunciation
- **PronunciationAttempt**: Pronunciation practice submissions and feedback

### Gamification
- **Badge**: Achievement badges
- **UserBadge**: User-earned badges
- **XpTransaction**: Experience points history
- **StudySession**: Study session tracking

## Database Schema

The database schema is generated from EF Core entities and configurations. Key features:

- **Guid IDs** for all primary keys
- **Unique indexes** on Email, Code fields
- **Performance indexes** on foreign keys and frequently queried fields
- **Enum storage** as strings for readability
- **Nullable fields** where appropriate
- **Timestamp tracking** with CreatedAt/UpdatedAt fields

## Next Development Phase

The immediate next steps are:

1. **Start Docker containers** and verify PostgreSQL/Redis connectivity
2. **Apply the migration** to create the database schema
3. **Create seed data** for initial development and testing
4. **Implement authentication** with JWT and refresh tokens
5. **Create first API endpoints** for user registration and login
6. **Set up Swagger** with proper grouping and JWT authorization UI

## Notes

- No test project is created per requirements
- Redis configuration is commented out pending package installation
- Mock AI provider will be used initially, optional providers can be added later
- All API endpoints will follow RESTful conventions
- Standard response wrapper will be implemented for consistent API responses