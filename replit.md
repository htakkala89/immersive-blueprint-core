# Solo Leveling RPG - Project Monarch's Shadow

## Overview

Solo Leveling RPG is an immersive romantic visual novel and RPG experience based on the popular Solo Leveling universe. Players take on the role of Sung Jin-Woo and develop a romantic relationship with Cha Hae-In while progressing through various storylines, activities, and combat scenarios. The game features AI-powered image generation, voice synthesis, comprehensive character progression, and multiple game systems working in harmony.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Components**: Radix UI with shadcn/ui styling
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React hooks and context for game state
- **Build System**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints with JSON communication
- **File Handling**: Express-fileupload for asset management

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL 16 (configured for Neon serverless)
- **Schema**: Comprehensive game state tracking with JSON fields for complex data
- **Migrations**: Drizzle-kit for schema management

## Key Components

### Game Systems
1. **Story Engine** - Branching narrative with choice consequences
2. **Character Progression** - Level, stats, skills, and equipment systems
3. **Relationship System** - Affection levels, intimacy progression, relationship status
4. **Daily Life Hub** - 22 interactive activities across 4 categories (Casual, Training, Home, Intimate)
5. **Combat System** - 2.5D side-scrolling dungeon raids with TFT-style mechanics
6. **Memory Constellation** - Shared experience tracking system
7. **Economy System** - Gold management and item purchasing
8. **Inventory Management** - Equipment and consumable item tracking

### AI Integration
- **Image Generation**: Multiple providers (Google Imagen, OpenAI DALL-E, NovelAI)
- **Conversation Engine**: Google Gemini for dynamic dialogue generation
- **Voice Synthesis**: ElevenLabs integration for character voices
- **Activity Proposals**: AI-powered activity suggestion system

### Content Management
- **Scene System** - Dynamic scene generation and caching
- **Episode Engine** - Structured episodic content with JSON configuration
- **Activity System** - Modular activity implementation with unique mechanics
- **Image Caching** - Preloaded location images for performance

## Data Flow

### Game State Management
1. **Session Creation**: New players receive initial game state with default values
2. **Choice Processing**: Player choices update game state and trigger narrative progression
3. **State Persistence**: All game state changes are saved to PostgreSQL database
4. **Real-time Updates**: Frontend receives immediate state updates via API responses

### Image Generation Pipeline
1. **Context Analysis**: System determines scene requirements (location, time, activity)
2. **Provider Selection**: Chooses appropriate AI provider based on content type
3. **Prompt Engineering**: Generates optimized prompts for consistent character appearance
4. **Caching System**: Stores generated images to reduce API calls
5. **Fallback Strategy**: Multiple providers ensure image generation reliability

### Activity Execution Flow
1. **Activity Selection**: Player chooses from available activities in Daily Life Hub
2. **Prerequisite Checking**: System validates energy, affection, and relationship requirements
3. **Dynamic Content**: AI generates contextual images and dialogue for the activity
4. **Outcome Processing**: Rewards, affection changes, and memory creation are applied
5. **State Updates**: Game state reflects all changes from the completed activity

## External Dependencies

### AI Services
- **Google Gemini API**: Primary conversation and narrative generation
- **Google Imagen**: High-quality scene and character image generation
- **OpenAI GPT-4**: Fallback for conversation and DALL-E for images
- **NovelAI**: Specialized provider for mature/intimate content generation
- **ElevenLabs**: Voice synthesis for character dialogue

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### Development Tools
- **Replit Environment**: Development and deployment platform
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool

## Deployment Strategy

### Production Configuration
- **Target**: Replit Autoscale deployment
- **Build Process**: Vite production build with Express server compilation
- **Port Configuration**: Server runs on port 5000, externally accessible on port 80
- **Environment Variables**: Secure API key management for all external services

### Development Workflow
- **Hot Reloading**: Vite development server with instant updates
- **Database Sync**: Drizzle push for schema synchronization
- **Asset Management**: Static file serving for generated images
- **Error Handling**: Comprehensive error tracking and recovery

### Performance Optimizations
- **Image Preloading**: Location images cached during startup
- **Rate Limiting**: Controlled API usage to prevent quota exhaustion
- **Lazy Loading**: Components and assets loaded on demand
- **Database Indexing**: Optimized queries for game state retrieval

## Changelog
- June 17, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.