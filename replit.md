# Blueprint Engine - Project Monarch's Shadow

## Overview

Project Monarch's Shadow represents the flagship demonstration of the Blueprint Engine - a revolutionary generative, transmedia platform that democratizes narrative creation. While Monarch's Shadow showcases a Solo Leveling romantic RPG experience, the true innovation lies in the underlying Blueprint Engine that empowers any user to become a creator of interactive experiences.

The platform supports two powerful creation pathways:
1. **AI Story Architect**: Generate complete interactive experiences from simple creative prompts
2. **Ingestion & Adaptation Engine**: Transform existing content (web novels, literature, historical events) into playable experiences

Monarch's Shadow serves as the proof-of-concept, demonstrating how all 18+ systems work in unison to create immersive, AI-powered interactive narratives.

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

### Blueprint Engine Core Systems
1. **Spatial View System** - Dynamic 3D environment generation and interaction
2. **Dialogue System** - Context-aware character conversations with personality modeling
3. **Quest Log** - Dynamic objective tracking and progression management
4. **Daily Life Hub** - 22+ interactive activities across multiple categories
5. **Intimate Activity System** - Mature content generation with relationship progression
6. **Relationship Constellation** - Multi-dimensional character relationship tracking
7. **Commerce Progression** - Economic systems and resource management
8. **World Map Navigation** - Spatial location management and travel systems
9. **AI Mood Engine** - Dynamic emotional state management for characters
10. **Combat System** - 2.5D dungeon raids with strategic mechanics
11. **Gear Management** - Equipment and inventory systems
12. **Living World** - Persistent environment with time progression
13. **Hunter's Communicator** - In-world communication systems
14. **Economy System** - Wealth and resource distribution
15. **Player Progression** - Skill development and character advancement
16. **Memory Constellation** - Shared experience and story tracking
17. **Calendar System** - Temporal progression with seasonal changes
18. **Episodic Story Engine** - Structured narrative progression and beats
19. **AI Story Architect** - Generate complete experiences from simple prompts
20. **Ingestion & Adaptation Engine** - Transform existing content into interactive experiences

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
- June 18, 2025. NovelAI integration fixed - corrected model name from nai-diffusion-4-curated-preview to nai-diffusion-3, intimate content generation now working properly producing 1.4MB images in 3.7 seconds
- June 18, 2025. NovelAI V4.5 Full model integrated with robust retry logic - enhanced image quality and reliable generation for mature content
- June 18, 2025. NovelAI integration completed - mature content generation fully operational
- June 18, 2025. AI narrator/game master system implemented for enhanced storytelling
- June 18, 2025. Calendar progression system with seasonal weather changes added
- June 17, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.