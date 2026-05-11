# ZenConsole

🚀 **Enterprise AI Platform** - A modern, professional AI management console with advanced features.

## ✨ Features

- 🎨 **Professional Login Page** - Modern glassmorphism design with smooth animations
- 🔐 **Secure Authentication** - Enterprise-grade security with JWT tokens
- 🌐 **Multi-Provider Support** - Integrate multiple AI providers seamlessly
- 📊 **Analytics Dashboard** - Real-time monitoring and usage statistics
- 🎯 **API Gateway** - Unified API interface for all AI services
- 🔄 **Load Balancing** - Intelligent request distribution
- 📝 **Usage Tracking** - Detailed logs and analytics
- 🌍 **Multi-language Support** - i18n ready

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Authentication:** JWT + Supabase Auth
- **State Management:** Redux Toolkit
- **UI Components:** Custom components with Material Symbols

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/SAZZAD-404/ZenColsole.git
cd ZenColsole
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your credentials:
# - Supabase URL and keys
# - JWT secrets
# - Other configuration
```

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql`
3. Create an admin user using `supabase/create-admin-user.sql`
4. Copy your Supabase credentials to `.env.local`

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:20128](http://localhost:20128) in your browser.

## 🔐 Default Credentials

**Admin Login:**
- Email: `admin@zenconsole.local`
- Password: `admin123`

⚠️ **Important:** Change the default password after first login!

## 📁 Project Structure

```
ZenConsole/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (public)/     # Public routes (login, landing)
│   │   ├── (dashboard)/  # Dashboard routes
│   │   ├── (admin)/      # Admin routes
│   │   └── api/          # API routes
│   ├── lib/              # Utility libraries
│   ├── models/           # Data models
│   ├── store/            # Redux store
│   └── shared/           # Shared components and constants
├── public/               # Static files
├── supabase/            # Database schemas and migrations
└── docs/                # Documentation
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Application port (default: 20128)

### Security Settings

Generate secure random strings for:
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate API key secret
openssl rand -base64 32

# Generate machine ID salt
openssl rand -base64 32
```

## 📚 Documentation

- [Setup Guide](./QUICK_SETUP.md)
- [GitHub Push Guide](./GITHUB_PUSH_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/api-endpoints.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Icons from [Material Symbols](https://fonts.google.com/icons)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ by SAZZAD-404**
