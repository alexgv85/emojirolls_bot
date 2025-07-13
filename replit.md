# Telegram Mini-App PvP Roulette Game

## Overview

This is a Telegram Mini-App that implements a PvP (Player vs Player) roulette game with TON blockchain integration. The application allows users to participate in real-time gambling games by contributing NFT gifts, with winners determined by proportional chance based on gift value. The app features a mobile-first design with five main sections: PvP gaming, single-player rolls, gift management, shop, and earning opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and build process

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live game updates
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: PostgreSQL-based session storage

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Telegram user data, balance, wallet addresses
- **Gifts**: NFT-like items with rarity, value, and ownership
- **PvP Games**: Game sessions with status, participants, and outcomes
- **Roll Sessions**: Single-player gambling sessions
- **Tasks**: Completion tracking for earning opportunities
- **Referrals**: User referral system for bonus earnings
- **Shop Items**: Purchasable gifts and items

## Key Components

### Gaming Logic
- **PvP Roulette**: Multi-player games where users contribute gifts and winner is determined by value-weighted probability
- **Single Rolls**: Individual gambling sessions with fixed cost and random rewards
- **Provably Fair**: Game integrity ensured through cryptographic hashing
- **Real-time Updates**: WebSocket integration for live game state synchronization

### User Interface
- **Mobile-First Design**: Optimized for Telegram's mobile environment
- **Bottom Navigation**: Five-tab interface (PvP, Rolls, Gifts, Shop, Earn)
- **Dark Theme**: Consistent with Telegram's design language
- **Responsive Components**: Adaptive layouts for various screen sizes

### Integration Systems
- **Telegram WebApp SDK**: Native integration with Telegram's mini-app platform
- **TON Blockchain**: Mock implementation for wallet connectivity and transactions
- **Real-time Notifications**: Toast notifications for game events and user actions

## Data Flow

1. **Authentication**: Users authenticate via Telegram WebApp SDK
2. **Game Participation**: Users select gifts to contribute to PvP games
3. **Real-time Updates**: WebSocket connections broadcast game state changes
4. **Outcome Determination**: Server-side logic determines winners using weighted randomization
5. **Reward Distribution**: Winning gifts transferred to victor's inventory
6. **Transaction Logging**: All game activities recorded in PostgreSQL database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **ws**: WebSocket server implementation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle-kit**: Database migration and schema management

### Telegram Integration
- **Telegram WebApp SDK**: Mini-app platform integration
- **TON Wallet**: Blockchain wallet connectivity (mock implementation)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: PostgreSQL with Drizzle migrations
- **WebSocket**: Development WebSocket server on same port

### Production Deployment
- **Build Process**: Vite builds frontend assets to `dist/public`
- **Server Bundle**: ESBuild bundles server code to `dist/index.js`
- **Database Migrations**: Drizzle-kit handles schema migrations
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection

### Replit Configuration
- **Development Script**: `npm run dev` starts both frontend and backend
- **Build Script**: `npm run build` creates production bundles
- **Start Script**: `npm start` runs production server
- **Database Push**: `npm run db:push` applies schema changes

The application follows a monorepo structure with shared TypeScript definitions between client and server, ensuring type safety across the full stack. The WebSocket integration provides real-time multiplayer functionality essential for the gaming experience.