# World Map Locations & Events System Specification

## Overview
The world map contains 5 zones with 15 locations total, each featuring unique interactive nodes and event systems. Locations unlock based on affection levels (200-800) and story progress.

## Zone Structure

### 1. Hongdae District (Youth Culture Hub)
**Theme:** Vibrant entertainment and casual dating
**Background:** Pink/purple gradient
**Locations:**
- **Hongdae Cafe** (Always Available)
  - Interactive Nodes: Artisan Menu, Cozy Window Seat, Local Art Display
  - Events: Coffee preferences discussion, intimate seating, cultural conversations
  - Activity Gateway: Grab Coffee activity from Daily Life Hub

- **Hongdae Arcade** (Always Available) 
  - Interactive Nodes: Not yet implemented
  - Planned Events: Competitive gaming, fun date activities

- **Hongdae Karaoke** (300+ Affection Required)
  - Interactive Nodes: Not yet implemented
  - Planned Events: Private singing sessions, romantic duets

### 2. Gangnam District (Luxury Shopping & Dining)
**Theme:** Upscale experiences and gift-giving
**Background:** Amber/yellow gradient
**Locations:**
- **Luxury Shopping Mall** (200+ Affection Required)
  - Interactive Nodes: Jewelry Counter, Designer Apparel, Luxury Confections
  - Events: Item inspection UI, gift browsing and purchasing
  - System Integration: Commerce System 7 for gift-giving

- **Fine Dining Restaurant** (400+ Affection Required)
  - Interactive Nodes: View Menu, Speak with Sommelier
  - Events: Menu selection UI, wine recommendations, dialogue influence
  - Cost: Gold expenditure for enhanced affection gains

- **Wellness Spa** (600+ Affection Required)
  - Interactive Nodes: Not yet implemented
  - Planned Events: Relaxation activities, couples treatments

### 3. Jung District (Historic & Cultural)
**Theme:** Traditional Seoul with romantic landmarks
**Background:** Blue/indigo gradient
**Locations:**
- **N Seoul Tower** (500+ Affection Required)
  - Interactive Nodes: Observation Deck, Wall of Locks
  - Events: Cinematic city views, lock ceremony (requires Padlock item)
  - Special: Memory Star creation system

- **Myeongdong Street** (Always Available)
  - Interactive Nodes: Not yet implemented
  - Planned Events: Street food, shopping, cultural experiences

- **Traditional Market** (Always Available)
  - Interactive Nodes: Not yet implemented
  - Planned Events: Authentic Korean culture, food experiences

### 4. Yeongdeungpo District (Business & Training)
**Theme:** Professional hunter activities
**Background:** Green/emerald gradient
**Locations:**
- **Hunter Association** (Always Available)
  - Interactive Nodes: Mission Board, Receptionist, Elevator Bank
  - Events: Lore panels, NPC hints, floor navigation
  - Integration: Professional dialogue context

- **Training Facility** (Story Progress 10+ Required)
  - Interactive Nodes: Sparring Ring, Combat Analytics, Equipment Rack
  - Events: Sparring shortcut, raid stats UI, equipment inspection
  - Activity Gateway: Direct access to Sparring Session

- **Hangang Park** (Always Available)
  - Interactive Nodes: Park Bench, Food Vendor Cart, River's Edge
  - Events: Reflective conversations, street food sharing, cinematic views
  - Special: High-affection memory star creation

- **Low-Rank Gate** (Always Available)
  - Interactive Nodes: Not yet implemented
  - Events: Entry-level dungeon access, combat training

### 5. Personal Spaces (Intimate Locations)
**Theme:** Private and romantic settings
**Background:** Purple/violet gradient
**Locations:**
- **Jin-Woo's Apartment** (Always Available)
  - **Tier 1 (Basic):** 4 direct intimate nodes
    - Bed, Living Room Couch, Kitchen Counter, Shower
    - Direct intimate activity access
  
  - **Tier 2 (Gangnam High-Rise):** 5 gateway nodes
    - Living Room Couch, Modern Kitchen, Balcony Door, Bedroom Door, Entertainment Center
    - Narrative gateway approach - unlocks activities in Day Planner
  
  - **Tier 3 (Hannam-dong Penthouse):** 7 luxury nodes
    - Infinity Pool, Artifact Display, Wine Cellar, Master Suite, Private Elevator
    - Ultimate intimacy gateways and luxury experiences
    - Relationship Constellation access

- **Cha Hae-In's Apartment** (800+ Affection Required)
  - Interactive Nodes: Vanity Table, Bookshelf, Bed, Window View, Tea Station
  - Events: Character insight systems, intimacy progression, tea preparation
  - Special: Deepest character development and intimate understanding

## Event System Architecture

### Interactive Node Types
1. **Direct Action Nodes:** Immediate outcomes (food vendors, item inspection)
2. **Gateway Nodes:** Unlock activities in Day Planner system
3. **Cinematic Nodes:** Atmospheric scenes with UI fade-outs
4. **NPC Dialogue Nodes:** Conversations with supporting characters
5. **System Integration Nodes:** Connect to other game systems

### Environmental Context System
- **Weather Influence:** Certain nodes affected by weather conditions
- **Time of Day:** Node availability changes based on current time
- **Story Flags:** Progress-based node unlocking
- **Visit History:** Different outcomes on repeat visits
- **Character Presence:** Special behaviors when Cha Hae-In is present

### Affection-Based Progression
- **0-199:** Basic locations (Hunter Association, Hangang Park, Hongdae Cafe)
- **200-299:** Luxury Shopping unlocked
- **300-399:** Karaoke venue unlocked  
- **400-499:** Fine Dining unlocked
- **500-599:** N Seoul Tower unlocked
- **600-799:** Wellness Spa unlocked
- **800+:** Cha Hae-In's Apartment unlocked

### Activity Integration Points
- **System 4 (Daily Life Activities):** Location nodes serve as shortcuts
- **System 6 (Memory Stars):** Special events create collectible memories
- **System 7 (Commerce):** Shopping locations integrate with economy
- **System 13 (Living World):** Environmental context affects availability

## Cha Hae-In Location Tracking
- **Dynamic Presence:** Yellow heart indicators show her current location
- **Time-Based Movement:** Location changes based on time of day
- **Schedule System:** Predictable patterns (morning: Hunter Association, evening: Hongdae Cafe)
- **Locked Location Visibility:** Her presence shown even in locked areas

## Current Implementation Status
✅ **Completed:**
- WorldMapCarousel with zone navigation
- Complete location unlock system
- Cha Hae-In presence tracking
- Interactive node definitions for most locations

🔄 **In Progress:**
- Environmental context system integration
- Complete node implementation for all locations

❌ **Missing:**
- Arcade and Karaoke interactive nodes
- Traditional Market and Myeongdong Street nodes
- Low-Rank Gate dungeon entrance
- Complete environmental state filtering

## Technical Architecture
- **Component:** WorldMapCarousel (primary interface)
- **Data Structure:** 5 zones with nested location arrays
- **State Management:** Affection-based filtering
- **Animation System:** Framer Motion transitions
- **Integration:** Direct connection to spatial interface location system