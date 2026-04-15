# SocialNetwork

A full-stack social media web application built with Next.js and Supabase, created as part of the VegaStack NextJS Intern Technical Assessment.

## 🚀 Live Demo
//

## 📋 Features

### Authentication
- JWT-based authentication via Supabase Auth
- User registration with email, username, first_name, last_name, password
- Username validation (3-30 chars, alphanumeric + underscore)
- Login with email and password
- Protected routes with Next.js middleware
- Logout functionality

### User Profiles
- View and edit own profile
- Profile fields: bio (max 160 chars), avatar_url, website, location
- Avatar upload to Supabase Storage (JPEG/PNG, max 2MB)
- User statistics: posts_count, followers_count, following_count

### Posts
- Create posts with text content (max 280 chars)
- Single image upload (JPEG/PNG, max 2MB) to Supabase Storage
- Delete own posts
- Paginated feed
- Denormalized like_count and comment_count on Post model

### Social Features
- Like/Unlike posts
- Add and delete comments
- Follow/Unfollow users
- Personalized feed (For You / Following tabs)
- Chronological feed of public posts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Authentication (JWT) |
| Storage | Supabase Storage |
| Deployment | Vercel |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (email, username, password, first_name, last_name)
- `POST /api/auth/login` - Login user, returns access token and profile data
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users` - List all users
- `GET /api/users/[user_id]` - Get user profile with posts_count
- `PATCH /api/users/[user_id]` - Update own profile
- `POST /api/users/[user_id]/follow` - Follow user
- `DELETE /api/users/[user_id]/follow` - Unfollow user
- `GET /api/users/[user_id]/followers` - Get followers list
- `GET /api/users/[user_id]/following` - Get following list

### Posts
- `GET /api/posts` - List all posts (with pagination)
- `POST /api/posts` - Create post
- `GET /api/posts/[post_id]` - Get single post
- `PATCH /api/posts/[post_id]` - Update own post
- `DELETE /api/posts/[post_id]` - Delete own post
- `POST /api/posts/[post_id]/like` - Like post
- `DELETE /api/posts/[post_id]/like` - Unlike post
- `GET /api/posts/[post_id]/comments` - List comments
- `POST /api/posts/[post_id]/comments` - Add comment
- `DELETE /api/posts/[post_id]/comments/[comment_id]` - Delete own comment

### Feed
- `GET /api/feed` - Get chronological feed (supports following filter)

### Upload
- `POST /api/upload` - Upload image to Supabase Storage

## 🗄️ Database Schema

### profiles
id, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at, updated_at

### posts
id, content, author_id, image_url, is_active, like_count, comment_count, created_at, updated_at

### likes
id, user_id, post_id, created_at

### comments
id, content, user_id, post_id, created_at, updated_at

### follows
id, follower_id, following_id, created_at

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/JokkimDoras/SocialConnect.git
cd SocialConnect
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
socialconnect/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── feed/
│   │   └── profile/
│   └── api/
│       ├── auth/
│       │   ├── register/
│       │   ├── login/
│       │   └── logout/
│       ├── posts/
│       │   └── [post_id]/
│       │       ├── like/
│       │       └── comments/
│       │           └── [comment_id]/
│       ├── users/
│       │   └── [user_id]/
│       │       ├── follow/
│       │       ├── followers/
│       │       └── following/
│       ├── feed/
│       └── upload/
├── components/
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── CreatePost.tsx
│   │   └── CommentSection.tsx
│   └── Navbar.tsx
└── lib/
    └── supabase.ts
\`\`\`

## 🔒 Security
- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive credentials
- JWT token authentication
- User can only modify their own data
