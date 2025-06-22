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

- June 22, 2025. Integrated Dialogue Window Affection Feedback COMPLETED - Moved sparkle hearts and affection gain notifications directly into the dialogue window instead of floating separately across the screen. Added real-time affection progress bar at top of conversation area showing current affection level (0-1000), relationship status (Acquaintance → Friend → Close Friend → Deep Bond), and animated progress tracking. Sparkle hearts now appear within the chat interface when gaining affection, creating immediate visual connection between conversations and relationship progress. System provides engaging gamification feedback directly connected to the dialogue impact.
- June 22, 2025. Conversation Affection System Fix COMPLETED - Fixed broken affection system where conversations weren't increasing affection levels. Added comprehensive affection gain logic to chat API: base +2 points per conversation, bonus +3 for romantic interactions, +2 for positive responses, +1 for longer meaningful messages. Frontend now properly updates game state with affection changes and logs progress. System provides progressive relationship building through natural conversation with Cha Hae-In.
- June 22, 2025. Dialogue Interface Complete UX Enhancement COMPLETED - Increased in-person dialogue container height from 55% to 70% of viewport to provide much more comfortable reading space for Cha Hae-In's responses. Expanded scrollable conversation area from 200px to 400px height for significantly better message visibility. Added invisible scrollbar styling with cross-browser support (IE, Firefox, Safari, Chrome). Implemented intelligent auto-scroll behavior: AI messages show from top for optimal readability while user messages scroll to bottom for natural input flow. Users no longer need to scroll up to read the beginning of her messages, and the clean interface eliminates visual distractions from scrollbars.
- June 22, 2025. AI Personality Enhancement COMPLETED - Completely overhauled Cha Hae-In's AI personality system to eliminate robotic responses and make her feel genuinely human. Enhanced emotional intelligence system with advanced response requirements prohibiting generic phrases like "That's... an interesting suggestion" and "Let me think about it". Added dynamic conversation capabilities including genuine surprise reactions, emotional depth for romantic proposals, contextual mood responses, and relationship-aware dialogue progression. Updated both in-person and communicator dialogue systems with sophisticated emotional context analysis that responds authentically to player frustration, romantic advances, and personal questions. AI now displays real personality traits including vulnerability, humor, concern, and spontaneous reactions based on affection level and conversation context.
- June 22, 2025. Mobile Dialogue Auto-Scroll Fix COMPLETED - Fixed mobile web dialogue scrolling issue where conversation was resetting to top after every new message. Replaced smart scrolling logic that positioned AI responses at 10% from top with consistent bottom-anchored scrolling for both user and AI messages. Mobile chat interface now maintains natural conversation flow at bottom without disruptive jumping or position resets.
- June 22, 2025. Core Stats Mobile UX Complete Optimization COMPLETED - Enhanced PlayerProgressionSystemRedesigned with comprehensive mobile optimization including invisible scrollbars for all three tabs (Core Stats, Relationship, Equipment). Fixed container height issue preventing "Sense" stat visibility by reducing mobile max-height from 400px to 320px. Added proper scrollbar-hide CSS utility with cross-browser support (-ms-overflow-style: none for IE, scrollbar-width: none for Firefox, ::-webkit-scrollbar display: none for Safari/Chrome). All sections now feature smooth touch scrolling with 44px minimum button targets, responsive spacing (space-y-3 on mobile, space-y-6 on desktop), and optimized typography. Mobile interface provides complete access to all stats through invisible smooth scrolling without visible scroll indicators.
- June 22, 2025. Monarch's Armory Complete Mobile Redesign COMPLETED - Completely rebuilt Monarch's Armory interface from ground up with mobile-first UX design. Replaced entire cramped horizontal layout with clean tab-based mobile interface featuring: full-screen mobile modal with organized tab navigation (Stats/Character/Equipment), 2x2 stats grid with animated updates and proper stat icons, character overview tab with equipment slots display, equipment management tab with full-width touch-friendly cards, proper rarity color coding and visual hierarchy, 44px minimum touch targets throughout, and smooth animations optimized for mobile interaction. Interface now provides excellent mobile user experience with no more cut-off equipment lists or cramped layouts.
- June 22, 2025. Old Constellation Component Removal COMPLETED - Completely removed old RelationshipConstellation and RelationshipConstellationSystem6 components from menu to eliminate duplicate constellation systems. Cleaned up imports and unused state variables for streamlined codebase. Navigation now flows cleanly from Character menu → "View Constellation" → New immersive interface with animated backgrounds, floating hearts, and comprehensive relationship tracking. Users now access only the beautiful redesigned relationship interface through the Character menu's relationship tab.
- June 22, 2025. Critical Episode Deletion & Dialogue Context Fixes COMPLETED - Fixed episode deletion persistence issue where deleted episodes were reappearing after deletion. Implemented file-based episode tracking system in deleted_episodes.json that permanently prevents deleted episodes from being loaded. Enhanced location-aware dialogue context system with strict filtering rules preventing work-related topics in personal spaces like apartments. Cha Hae-In now maintains appropriate conversation topics based on current location setting. Premium script formatting confirmed working correctly in chat interface. System successfully tested with complete episode deletion and proper filtering.
- June 22, 2025. Enhanced Affection Tracking Visibility COMPLETED - Added prominent affection level display in Character progression menu's Relationship tab showing current affection value, progress bar toward 1000 maximum, and next unlock target information. Enhanced interface clearly indicates which locked areas users can access at different affection levels: Luxury Shopping (200+), Fine Dining (400+), N Seoul Tower (500+), and Wellness Spa (600+). System now provides comprehensive affection tracking across multiple interface locations including Character menu, Relationship Constellation, world map tooltips, and activity completion rewards.
- June 22, 2025. Core Stats & Relationship Constellation Integration COMPLETED - Fixed corrupted PlayerProgressionSystem16 component structure that was preventing application startup. Replaced with clean, properly structured component featuring mobile-optimized Core Stats tab with working stat allocation system, visual progress bars for health/mana/experience, and responsive layouts with proper touch targets. Replaced empty Skills tab with meaningful Relationship Constellation access interface that provides context about the bond with Cha Hae-In and smooth navigation to constellation view. Added Equipment tab with proper inventory/armory integration and quick overview statistics. Component now properly handles stat allocation, displays player progression data, and maintains consistent visual design throughout all tabs.
- June 22, 2025. Mobile Inventory & Equipment Management System COMPLETED - Fixed broken MonarchInventorySystem component with proper JSX structure and implemented comprehensive mobile-responsive inventory interface. Created mobile-optimized layouts with 3-column grid on mobile devices, touch-friendly 44px minimum button targets, horizontal filter tabs that stack vertically on desktop, and optimized spacing throughout. Added working equipment management system with proper equip/unequip functionality, stat application/removal, item upgrades with cost calculations, and gift system for Cha Hae-In affection gains. Enhanced Cha Hae-In location visibility on world map with pulsing yellow heart indicators that show her presence even in locked areas, ensuring users always know where she is located.
- June 22, 2025. World Map Carousel System Implementation COMPLETED - Replaced WorldMapSystem8 with modern carousel-based WorldMapCarousel for superior mobile experience. Implemented zone-based navigation with left/right arrows, showing one district at a time with smooth transitions. Added comprehensive Cha Hae-In location tracking that displays her presence even in locked areas with distinctive yellow heart indicators. Enhanced mobile-responsive design with touch-friendly navigation, proper legends, and progress indicators. System now supports 5 distinct zones: Hongdae District, Gangnam District, Jung District, Yeongdeungpo District, and Personal Spaces.
- June 22, 2025. Character Interface Mobile Optimization COMPLETED - Fixed mobile responsiveness issues across entire Character progression system. Enhanced header, tab navigation, content areas with proper mobile sizing (sm: breakpoints), touch-friendly buttons (44px minimum), responsive typography, optimized spacing and padding. Equipment tab cards now stack properly on mobile with condensed layouts and hidden descriptions. Stats display optimized for mobile screens with improved icon sizing and responsive layouts.
- June 22, 2025. Monarch's Aura Menu Reorganization COMPLETED - Reorganized Monarch's Aura menu based on user requirements: renamed "Exit Game" to "Leave World", removed "Start Episode 1" item, and moved Inventory and Armory into Character menu as Equipment tab. Character interface now has three tabs (Core Stats, Monarch's Constellation, Equipment) with dedicated access cards for inventory and armory systems. Completed notification system integration into Monarch's Aura menu structure.
- June 22, 2025. In-Person Dialogue Initial Greeting Fix COMPLETED - Fixed empty conversation area issue when opening in-person dialogue interface with Cha Hae-In. Modified handleChaHaeInInteraction to properly add AI-generated greeting to conversation history, ensuring users see Cha Hae-In's contextual opening message immediately instead of blank dialogue area. Added fallback greeting handling for both successful AI responses and error scenarios.
- June 22, 2025. Notification System Duplicate Prevention Fix COMPLETED - Fixed duplicate notification issue in centralized notification bell system by implementing deduplication logic that prevents identical notifications with same title and message from appearing multiple times. Cleaned up episode notification triggers to prevent multiple calls and ensured proper TypeScript typing. Notification bell now properly manages unique notifications without overlay disruptions.
- June 22, 2025. Complete Notification System Centralization COMPLETED - Fully migrated all overlay notifications, system alerts, and toast messages to the centralized notification bell system. Modified useToast hook to automatically redirect all toast calls to notification bell instead of showing overlay toasts. Disabled visual toast overlay component completely. Removed Hunter Communicator system alerts bell and migrated all episode alerts and quest notifications to the central notification system. All game notifications now appear exclusively in the notification bell dropdown, eliminating screen overlay distractions and providing organized notification management.
- June 22, 2025. Notification Bell System Implementation COMPLETED - Created comprehensive notification bell system to replace disruptive pop-up notifications. Added NotificationBell component with dropdown interface, unread badge counter, notification categorization (info/success/warning/error), auto-cleanup for non-persistent notifications, and mobile-optimized design. Replaced all existing notification triggers throughout spatial interface with centralized bell system to reduce user distraction and improve UX.
- June 22, 2025. Complete Mobile Interface Optimization COMPLETED - Enhanced all mobile interfaces with comprehensive responsiveness fixes including WorldMapSystem8 optimization, Monarch's Aura button repositioning (top-4 right-4 with 48px touch targets), menu system with 44px minimum heights, notification system repositioning, and global mobile CSS fixes. Added horizontal scroll prevention, touch optimization, iOS input handling, and tap highlight removal. Changed Daily Life icon from gift to home icon for better semantic representation.
- June 22, 2025. Mobile Chat Space Optimization COMPLETED - Enhanced Hunter Communicator mobile layout to maximize screen space utilization. Reduced padding from 4 to 2-3 units on mobile, decreased avatar sizes from 12 to 8 units, increased message bubble width from 85% to 90% on mobile, optimized header spacing with responsive design, and minimized input area padding. Chat interface now provides significantly more room for conversation content on mobile devices while maintaining premium visual design.
- June 22, 2025. Smart Auto-Scroll System COMPLETED - Implemented intelligent auto-scroll behavior for in-person dialogue interface. AI responses now auto-scroll to show the beginning of Cha Hae-In's new messages for optimal readability, while user messages scroll to bottom for natural input flow. System positions new AI responses 10% from top of visible area to ensure users can read responses from the start while maintaining conversation immersion.
- June 22, 2025. Premium Script Formatting & Natural Conversation COMPLETED - Fully implemented end-to-end cinematic text formatting with proper frontend parsing. Added `parseCinematicMessage` function to split server-formatted responses by double line breaks, displaying dialogue in white text, actions as amber italics, and thoughts as gray asides. Enhanced Cha Hae-In personality to eliminate robotic "Hunter Sung Jin-Woo" repetition, making conversations natural and engaging. Updated speech patterns to use titles sparingly and transition to direct conversation flow. System now delivers authentic character interactions with premium script-like visual presentation.
- June 22, 2025. Premium Script Formatting Enhancement COMPLETED - Fully implemented server-side post-processing for premium cinematic text formatting. Enhanced regex-based parsing system now properly separates dialogue, actions, and thoughts on individual lines with double line breaks for script-like presentation. Server-side formatting function intelligently parses AI responses to extract quoted dialogue, asterisk actions, and parentheses thoughts, then reconstructs them with proper line separations. Frontend styling displays dialogue in clean white text, actions as amber stage directions, and thoughts as indented gray asides. System ensures consistent premium script formatting regardless of AI response structure.
- June 21, 2025. Premium Cinematic Text Formatting COMPLETED - Successfully implemented cinematic block-level message presentation using regex-based parsing for reliable text separation. Dialogue displays in clean white text with larger font size, actions appear in amber italics as stage directions, thoughts show indented in gray italics with left border as private asides. Enhanced typography with line height 1.6, proper letter spacing, font weights, and visual hierarchy. Applied inline styles for consistent rendering with enhanced shadows and mobile optimization. System now parses messages with quotes, asterisks, and parentheses into separate styled elements for premium script-like presentation.
- June 21, 2025. Mobile Chat Keyboard Fix - Fixed mobile keyboard overlay issue where virtual keyboard was covering chat interface, preventing users from seeing their input. Enhanced mobile viewport handling with proper CSS adjustments and keyboard visibility detection for better mobile user experience. Added dynamic viewport height calculations and auto-scroll functionality when keyboard appears.
- June 21, 2025. Chat Message Formatting Enhancement - Fixed message parsing system to properly differentiate between spoken dialogue, physical actions, and internal thoughts. Updated AI prompt system to use proper formatting syntax (quotes for dialogue, asterisks for actions, parentheses for thoughts). Enhanced chat readability with visual hierarchy using different colors and styling for each message type.
- June 21, 2025. Chat System & Episode Integration Fix - Fixed Cha Hae-In's repetitive training suggestions by integrating proper episode checking into chat responses. Enhanced personality system with diverse conversation topics for different locations. Added MutationObserver for chat auto-scrolling to handle avatar loading interference. Repositioned notifications to avoid UI conflicts.
- June 21, 2025. Mobile Chat Optimization & UI Fix - Enhanced chat interface with mobile-responsive design, proper auto-scrolling with smooth animations, optimized message bubbles for mobile screens (85% max width), improved input area with mobile-friendly sizing, and repositioned notification system to slide in from right side to avoid overlap with Monarch's Aura button.
- June 21, 2025. Intimate Content Enhancement - Completely removed Jin-Woo references from all intimate scenes, enhanced explicit content with detailed anatomy descriptions, updated Cha Hae-In physical description to "short bob cut golden blonde hair with straight bangs, striking violet purple eyes", implemented activity-specific explicit scenarios (shower, bedroom, massage, undressing), and verified solo focus approach for all mature content generation.
- June 21, 2025. Notification System Reduction - Disabled random notification generation system and reduced auto-save frequency from 30 seconds to 5 minutes to minimize push notification frequency as requested.
- June 13, 2025. Hybrid Multi-Episode System Implementation - Completed advanced episode orchestration allowing multiple active episodes with intelligent priority weighting (Primary 60%, Secondary 30%, Background 10%). Features contextual blending based on location and time, dynamic priority adjustment, backwards compatibility with single-episode focus, and seamless AI chat integration for emergent storytelling.
- June 13, 2025. Episode Focus System Chat Integration - Fixed narrative confusion by ensuring only the focused episode influences AI responses
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.