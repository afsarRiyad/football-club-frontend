# Football Club Frontend

A modern football club management platform built with Next.js, featuring comprehensive club administration, player management, match tracking, and fan engagement tools.

## Features

- **Club Management**: Admin dashboard for club operations
- **Player & Squad Management**: Complete player profiles and squad tracking
- **Match Management**: Live scores, fixtures, and match results
- **News & Media**: Club news, gallery, and content management
- **Academy System**: Youth development and training programs
- **Statistics & Analytics**: Performance tracking and data visualization
- **User Authentication**: Role-based access control (Admin, Coach, Scorer, etc.)
- **Responsive Design**: Mobile-first design with professional football club aesthetics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/afsarRiyad/football-club-frontend.git
cd football-club-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js app directory
│   ├── (auth)/          # Authentication pages
│   ├── (public)/        # Public pages
│   ├── (protected)/     # Protected pages
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── layout/          # Layout components
│   ├── shared/          # Shared components
│   └── ui/              # UI components
├── context/             # React contexts
├── lib/                 # Utility functions
└── types/               # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design System

The project uses a professional football club color palette:
- **Primary**: Deep Navy (#0B2545)
- **Accent**: Bold Red (#D62828) 
- **Gold**: Achievement Gold (#FFC107)
- **Background**: Off-white (#F7F7F5)

Typography uses Clash Display for headings, Inter for body text, and JetBrains Mono for statistics.

## User Roles

- **SUPER_ADMIN**: Full system access
- **CLUB_ADMIN**: Club management
- **TEAM_MANAGER**: Team operations
- **COACH**: Training and player development
- **SCORER**: Match scoring
- **MEMBER**: Regular user access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
