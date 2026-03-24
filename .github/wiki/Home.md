# Welcome to ɳTask

**The production-ready, AI-friendly boilerplate for modern web applications.**

ɳTask is a complete Next.js reference app with multi-backend support, designed to accelerate your development whether you're coding by hand or using AI tools like Bolt.new, Lovable, Cursor, or Copilot.

---

## 🚀 Quick Start

Get up and running in 3 commands:

```bash
git clone https://github.com/nself-org/tasks.git my-app
cd my-app
cd backend && make up          # Start self-hosted backend
cd .. && npm install && npm run dev  # Start frontend
```

Open [http://localhost:3000](http://localhost:3000) — your app is live!

---

## 📚 What's Included

This boilerplate provides everything you need out of the box:

### **Frontend**

- ⚡ Next.js 13 with App Router
- 🎨 Tailwind CSS + shadcn/ui components
- 🔐 Authentication with protected routes
- 📝 Complete todo app with sharing
- 🌓 Dark mode support
- 📱 Responsive design

### **Backend**

- 🐘 PostgreSQL database
- 🚀 Hasura GraphQL Engine
- 🔑 JWT authentication
- 📦 S3-compatible storage
- 🔄 Real-time subscriptions
- 🐳 Docker Compose deployment

### **Multi-Backend Support**

Switch backends with one environment variable:

- **nSelf** - Self-hosted (Docker)
- **Supabase** - Managed PostgreSQL + Auth
- **Nhost** - Managed Hasura + Auth
- **Bolt** - Bolt.new managed

---

## 📖 Documentation

### Getting Started

- **[Getting Started](Getting-Started)** - Installation and first steps
- **[Quickstart Guide](Quickstart-Guide)** - Get running in 5 minutes (Bolt.new users)
- **[Backend Setup](Backend-Setup)** - Start your self-hosted backend

### Core Concepts

- **[Backend Architecture](Backend-Architecture)** - How the backend works
- **[Database Schema](Database-Schema)** - Tables and relationships

### Guides & Reference

- **[Deployment](Deployment)** - Deploy to production
- **[Developer Tools](Developer-Tools)** - Testing, debugging, and development
- **[Security](Security)** - Security best practices and guidelines
- **[Contributing](Contributing)** - How to contribute to the project
- **[Changelog](Changelog)** - Version history and updates

---

## 🤖 Built for AI

This boilerplate is optimized for AI-assisted development:

- **Clear architecture** - AI tools understand the structure instantly
- **Backend abstraction** - Switch providers without rewriting code
- **Type-safe** - TypeScript everywhere for better AI suggestions
- **Component library** - shadcn/ui components AI tools know well
- **Documentation** - Comprehensive docs help AI understand your intent

Works great with:

- Bolt.new / Lovable
- Cursor / Copilot
- AI Code
- Any AI coding assistant

---

## 💡 Example Application

The boilerplate includes a complete todo application demonstrating:

- ✅ CRUD operations (Create, Read, Update, Delete)
- 🔓 Public/private visibility toggle
- 📧 Share todos by email with view/edit permissions
- 🔗 Shareable public links
- 🔄 Real-time updates (with WebSocket backends)
- 🎨 Modern UI with Tailwind + shadcn/ui

**Use this as a reference** - See how authentication, database operations, and sharing work, then build your own features following the same patterns.

---

## 🎯 What to Do Next

1. **[Get Started](Getting-Started)** - Follow the installation guide
2. **[Explore the Example](Database-Schema)** - See how todos work
3. **[Customize](Customization)** - Replace the example with your app
4. **[Deploy](Deployment)** - Ship to production

---

## 🆘 Need Help?

- 📖 **[Documentation](Home)** - You're here!
- 🐛 **[Issues](https://github.com/nself-org/tasks/issues)** - Report bugs or request features
- 💬 **[Discussions](https://github.com/nself-org/tasks/discussions)** - Ask questions
- 📝 **[Changelog](Changelog)** - See what's new

---

**Ready to build something amazing?** [Get Started →](Getting-Started)

---

## Project Resources

- [Changelog](Changelog.md) — Version history and release notes
- [Contributing](Contributing.md) — How to contribute to this project
- [Security](Security.md) — Security best practices and guidelines
- [License](LICENSE.md) — Licensing terms and conditions
