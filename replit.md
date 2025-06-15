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

- June 15, 2025. Date Scheduling System Implementation - Completed comprehensive date scheduling system with real consequences for keeping or missing planned dates. Added "Schedule Date" button to Monarch's Aura menu (replacing "Exit Game" with "Leave World"). System includes database integration with scheduledDates table, consequence mechanics (-5 to -15 affection for missed dates, +3 to +8 for kept dates), and full frontend/backend API integration. Players can now make commitments to Cha Hae-In and face real relationship consequences.
- June 15, 2025. Dynamic Prompts Context Fix - Fixed face-to-face dialogue incorrectly showing communicator-style prompts ("I wish we could talk in person") when already talking in person at locations like the cafe. Implemented isInPersonDialogue detection to ensure appropriate prompt context. In-person conversations now show contextually relevant prompts while communicator mode shows proper texting-style prompts.
- June 15, 2025. Time-Aware Location Activity Fix - Fixed location tooltips showing time-inappropriate activities (morning latte at night) by implementing getTimeAppropriateActivity() function in both frontend and backend. Location activities now dynamically change based on actual time: morning coffee → afternoon iced coffee → evening casual atmosphere → night herbal tea. Ensures consistency between displayed time and Cha Hae-In's activities.
- June 15, 2025. Location-Aware AI Response Fix - Fixed Cha Hae-In giving work-related responses at inappropriate locations by creating getLocationAppropriateActivity() function. Replaced hardcoded "reviewing reports" fallback with contextually appropriate activities based on actual location and time of day. Now responds with coffee shop activities when at cafe, romantic activities when at restaurants, etc.
- June 15, 2025. Mobile Legend and Affection Bar Fix - Fixed affection bar overflow by correcting scale from /10 to /100 and implemented mobile status bar positioned above carousel. Mobile now shows compact Cha Hae-In status, time, and affection without interface blocking. Desktop retains full legend panel with all details.
- June 15, 2025. Mobile Location Carousel System - Created horizontal scrolling carousel for mobile devices with 3x3 location grids in cards, hidden scrollbars, and 64px touch targets. Fixed overlay issues by positioning legend above carousel and implementing responsive design. Desktop maintains spatial map while mobile gets native app-like location browsing experience.
- June 15, 2025. Enhanced Cha Hae-In Movement System - Completely redesigned location movement patterns with much lower affection requirements. Morning coffee meetings at 30+ affection, afternoon rotation between Hunter Association/Training Facility/Hunter Market every 30 minutes at 50+ affection, evening activities starting from just 10+ affection, and night availability at 20+ affection. Added time-based automatic location rotation and debug status panel showing current location and requirements.
- June 15, 2025. World Map Cha Hae-In Indicator Fix - Fixed missing Cha Hae-In location indicators by correcting location state priority logic. Enhanced mobile visibility with larger sparkle effects (7-9px), improved glow shadows, and better visual distinction. Added smart communicator fallback for locked locations where she's present. Golden sparkle effects now properly display at all times including night, with rotating animation and enhanced brightness for mobile devices.
- June 15, 2025. Solo Leveling Combat System Vision Complete - Enhanced combat system with true Solo Leveling atmosphere featuring cinematic power aura effects, Shadow Army summoning with visual indicators, epic damage numbers with power scaling, enhanced camera shake based on attack power, immersive combat log with story-driven messages, S-Rank Hunter status display, and Monarch-themed UI elements. Combat now captures the overwhelming power fantasy of Jin-Woo with abilities like "Shadow Exchange", "Ruler's Authority", and "Arise" commands. Mobile-first responsive design maintains premium experience across all devices.
- June 15, 2025. Mobile-First Combat UI Redesign - Completely redesigned combat interface with mobile-first responsive design. Mobile features horizontal enemy cards (64px avatars), scrollable action row with 80px touch targets, and compact labels. Desktop maintains large vertical enemy cards (160px avatars) with spacious grid layout. Implemented minimal top HUD, smart MP validation, smooth animations, and proper mobile/desktop responsive behavior. Transformed interface from mobile-unusable to premium experience across all devices.
- June 14, 2025. Hunter Communicator Complete Mobile Rebuild - Completely rebuilt Hunter's Communicator with new HunterCommunicatorMobile component designed from ground-up for mobile devices. Implemented full-screen mobile layout, dramatically larger conversation items (140px height, 32px padding), 20x20 avatars, large text sizes (name: 2xl, message: xl, timestamp: lg), mobile-first navigation with bottom sheet pattern, improved touch targets throughout, smooth animations, and responsive chat interface. Replaced HunterCommunicatorSystem15 with mobile-optimized version that provides native app-like experience on mobile devices while maintaining premium glassmorphism design.
- June 14, 2025. Mobile Responsiveness Fix - Fixed critical mobile interface issue with Character Command system (PlayerProgressionSystem16). Implemented proper mobile scrolling with touch support, responsive layout for all screen sizes, optimized padding and spacing for mobile devices, and improved stat allocation button sizing. The interface now properly displays Core Attributes data and allows full interaction on mobile devices while maintaining the premium frosted glass aesthetic.
- June 13, 2025. Character Command System Redesign - Completely redesigned the PlayerProgressionSystem16 component (accessed via Monarch's Aura "Character" menu) with enhanced visual design featuring animated power core header, total power level display, enhanced progress bars with glow effects, interactive stat allocation with visual feedback, and improved glassmorphism styling throughout. Added smooth animations and better user experience for character progression.
- June 13, 2025. Dialogue Interface Layout Fix - Fixed conversation container to use 180px fixed height, dialogue area constrained to 220px, and reduced modal from 55vh to 45vh preventing input controls from being pushed off screen. Removed flex-1 expansion that was causing overflow issues. Updated Hunter's Communicator to display Cha Hae-In's actual avatar image instead of emoji in both conversation list and chat header. Improved modern messaging app behavior with proper scrolling and fixed input positioning.
- June 13, 2025. Smart World Map Communication System - Enhanced world map to always show Cha Hae-In's location even when restricted, with visual indicators distinguishing accessible vs locked locations. Clicking on locked locations where she's present automatically opens Hunter's Communicator for seamless communication. Added blue-gold aura animation for locked locations with Cha Hae-In presence and integrated full affection tracking in communicator mode.
- June 13, 2025. Dynamic Quest Node Spawning System - Fixed missing gate entrances by implementing automatic quest objective spawning. System now generates appropriate interactive elements (gate entrances, monster spawns, investigation points, delivery targets) at quest target locations when quests are accepted. Quest nodes are visually distinct and properly handle completion logic with progress tracking.
- June 13, 2025. Affection Tracking Fix - Resolved critical issue where dialogue system wasn't persisting affection gains to database. Fixed database connection problems by switching from WebSocket to HTTP connection, corrected field mapping between frontend (affection) and database (affectionLevel), and implemented proper persistence logic. Affection now properly tracks with +1 base gain per conversation and +2-3 bonus for romantic moments that trigger the Affection Heart system.
- June 13, 2025. UI Position Fix - Moved episode eye (MysticalEye) from top-right to top-left to prevent overlap with Monarch's Aura button. Improved UI accessibility and visual clarity.
- June 13, 2025. UI Cleanup - Removed redundant "Start Episode 1" menu item from Monarch's Aura interface. Streamlined episode access through the proper Episodes selector system, reducing menu clutter and user confusion.
- June 13, 2025. Enhanced Romance Constellation System - Redesigned the relationship visualization with improved 3D constellation interface featuring emotional weight-based star sizing, category-based memory organization (first moments, growing closer, intimate bonds, special occasions), interactive memory replay system, connection lines showing relationship progression, and immersive ambient effects. Includes music integration and enhanced storytelling elements.
- June 13, 2025. Hybrid Multi-Episode System Implementation - Completed advanced episode orchestration allowing multiple active episodes with intelligent priority weighting (Primary 60%, Secondary 30%, Background 10%). Features contextual blending based on location and time, dynamic priority adjustment, backwards compatibility with single-episode focus, and seamless AI chat integration for emergent storytelling.
- June 13, 2025. Episode Focus System Chat Integration - Fixed narrative confusion by ensuring only the focused episode influences AI responses
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.