# Solo Leveling RPG - Replit Guide

## Overview

This is a comprehensive romantic RPG based on the Solo Leveling manhwa, featuring an interactive story with Cha Hae-In and Jin-Woo. The game combines narrative-driven gameplay with strategic combat systems, daily life activities, and AI-generated scene imagery to create an immersive experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: React hooks and context for local state
- **Build Tool**: Vite with custom plugin configuration
- **Styling**: Tailwind CSS with custom design system variables

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for game state and image generation
- **File Processing**: Express-fileupload for handling media uploads

### Data Storage Solutions
- **Database**: PostgreSQL 16 via Neon serverless
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Comprehensive game state tracking with JSON fields for complex data
- **Caching**: In-memory caching for images and frequently accessed data

## Key Components

### Core Game Systems
1. **Story Engine**: Branching narrative system with scene management
2. **Combat System**: 2.5D side-scrolling raid mechanics with TFT-style strategy
3. **Daily Life Hub**: 22+ interactive activities across 4 categories
4. **Image Generation**: AI-powered scene and character image creation
5. **Voice System**: Text-to-speech integration for character dialogue
6. **Relationship System**: Progressive affection and intimacy mechanics

### Activity Categories
- **Casual Outings** (7 activities): Coffee dates, park walks, shopping, entertainment
- **Training & Hunter Life** (4 activities): Sparring, raid footage review, gate clearing
- **Home Life** (6 activities): Cooking, furniture assembly, balcony conversations
- **Intimate** (5 activities): Back rubs, cuddling, shower scenes, passionate encounters

### Combat Features
- Real-time 2.5D side-scrolling combat
- 4-slot action bar with cooldown management
- Synergy system with Cha Hae-In for team attacks
- Visual feedback with damage numbers and camera shake
- Interactive healing items and strategic positioning

## Data Flow

### Game State Management
1. Client requests game state via session ID
2. Server retrieves from PostgreSQL or creates new state
3. Story engine processes current scene and available choices
4. Image generator creates contextual scene imagery
5. Response includes narrative, choices, and visual assets

### Activity Execution
1. Player selects activity from Daily Life Hub
2. Activity handler validates requirements (energy, affection, etc.)
3. Modal system displays activity-specific interface
4. Completion rewards are calculated and applied
5. Game state updates persist to database

### Image Generation Pipeline
1. Scene context analysis determines appropriate generator
2. Google Cloud Imagen for high-quality scenes
3. NovelAI for mature/intimate content when needed
4. Prompt engineering ensures character consistency
5. Generated images cached for performance

## External Dependencies

### AI Services
- **Google Cloud Vertex AI**: Primary image generation using Imagen 3.0 Fast
- **OpenAI API**: Fallback image generation and text processing
- **Google Gemini**: Advanced narrative generation and character responses
- **Anthropic Claude**: Alternative AI processing when configured

### Authentication & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Cloud Auth**: Service account authentication for Vertex AI
- **File System**: Local storage for cached images and assets

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **TSX**: TypeScript execution for development
- **ESBuild**: Production build optimization

## Deployment Strategy

### Environment Configuration
- **Development**: Local server on port 5000 with hot reload
- **Production**: Autoscale deployment with optimized builds
- **Database**: Automated provisioning of PostgreSQL instance

### Build Process
1. Vite builds client-side React application
2. ESBuild bundles server-side TypeScript to ESM
3. Static assets copied to distribution directory
4. Database migrations applied automatically

### Runtime Requirements
- Node.js 20+ for modern JavaScript features
- PostgreSQL 16 for database operations
- Environment variables for API keys and database connection

## Changelog

- June 21, 2025. Chat System & Episode Integration Fix - Fixed Cha Hae-In's repetitive training suggestions by integrating proper episode checking into chat responses. Enhanced personality system with diverse conversation topics for different locations. Added MutationObserver for chat auto-scrolling to handle avatar loading interference. Repositioned notifications to avoid UI conflicts.
- June 21, 2025. Mobile Chat Optimization & UI Fix - Enhanced chat interface with mobile-responsive design, proper auto-scrolling with smooth animations, optimized message bubbles for mobile screens (85% max width), improved input area with mobile-friendly sizing, and repositioned notification system to slide in from right side to avoid overlap with Monarch's Aura button.
- June 21, 2025. Intimate Content Enhancement - Completely removed Jin-Woo references from all intimate scenes, enhanced explicit content with detailed anatomy descriptions, updated Cha Hae-In physical description to "short bob cut golden blonde hair with straight bangs, striking violet purple eyes", implemented activity-specific explicit scenarios (shower, bedroom, massage, undressing), and verified solo focus approach for all mature content generation.
- June 21, 2025. Notification System Reduction - Disabled random notification generation system and reduced auto-save frequency from 30 seconds to 5 minutes to minimize push notification frequency as requested.
- June 13, 2025. Hybrid Multi-Episode System Implementation - Completed advanced episode orchestration allowing multiple active episodes with intelligent priority weighting (Primary 60%, Secondary 30%, Background 10%). Features contextual blending based on location and time, dynamic priority adjustment, backwards compatibility with single-episode focus, and seamless AI chat integration for emergent storytelling.
- June 13, 2025. Episode Focus System Chat Integration - Fixed narrative confusion by ensuring only the focused episode influences AI responses
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.