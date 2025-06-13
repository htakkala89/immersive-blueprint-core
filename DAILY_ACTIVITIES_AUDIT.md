# Daily Life Activities Audit - Solo Leveling RPG

## Casual Outings Category

### Basic Activities
- **Grab Coffee** / **Coffee Date in Hongdae** / **Morning Coffee**
  - Energy Cost: 10-15
  - Affection Gain: 1-2
  - Description: Casual cafe meetings for conversation

- **Hangang Walk** / **Walk at Hangang Park**
  - Energy Cost: 10-15
  - Affection Gain: 2-3
  - Memory Creation: Yes
  - Description: Peaceful riverside strolls with deep conversations

- **Shopping for Gifts** / **Shopping in Gangnam** / **Shopping Together**
  - Energy Cost: 20
  - Affection Gain: 1-2
  - Gold Requirement: 100,000-500,000 won
  - Description: Browse boutiques and pick outfits together

- **Visit Arcade**
  - Energy Cost: Varies
  - Description: Competitive gaming and entertainment

- **Evening Walk**
  - Energy Cost: Varies
  - Description: Nighttime strolls

## Training & Hunter Life Category

- **Review Raid Footage**
  - Features: Video player interface, performance analysis, synergy buffs
  - Duration: 180 seconds with segments
  - Rewards: +5% raid effectiveness

- **Clear Low-Rank Gate** / **Solo Gate Raid**
  - Energy Cost: 40
  - Gold Reward: 100-500,000 won
  - Experience: 50-300 XP
  - Gate Options: D-Rank Goblin Den, C-Rank Orc Encampment, D-Rank Crystal Mines
  - Level Requirement: 10+

- **Joint Raid with Cha Hae-In**
  - Energy Cost: 50
  - Gold Reward: 200,000 won
  - Experience: 80 XP
  - Affection: 10
  - Requirement: 70+ affection, not dating status

- **Training Together**
  - Energy Cost: Varies
  - Description: Combat training sessions

## Home Life Category

- **Assemble New Furniture**
  - Features: Multi-phase assembly, intelligence checks, humor dialogue
  - Memory Creation: Yes

- **Cooking Together**
  - Energy Cost: 20
  - Affection Gain: 25
  - Level Requirement: 3 (60+ affection)
  - Description: Romantic cooking experience

- **Lunch Date**
  - Energy Cost: Varies
  - Description: Midday meal together

## Intimate Category

### Progressive Intimacy Levels

**Level 1-2 Activities:**
- Basic romantic interactions

**Level 3+ Activities:**
- **Give Back Rub**
  - Features: Multi-phase progression, gentle care dialogue, mood enhancement
  - Affection: Heart triggers

**Level 4+ Activities:**
- Activities requiring devoted partnership (80+ affection)

**Level 5+ Exclusive Activities:**
- **Wedding Night**
  - Energy Cost: 50
  - Affection Gain: 100
  - Requirement: Perfect love (100+ affection)
  - Description: Ultimate romantic union (18+)

- **Private Beach** / **Beach Vacation**
  - Energy Cost: 45
  - Affection Gain: 80
  - Requirement: Ultimate trust (100+ affection)
  - Description: Secluded romantic getaway (18+)

## Special Activities

- **Propose Living Together**
  - Energy Cost: 30
  - Requirement: 80+ affection, not living together
  - Description: Relationship milestone progression

## Activity Features System

### Common Elements:
- Energy cost system
- Affection rewards
- Time-of-day restrictions
- Gold requirements for certain activities
- Level gating for progression
- Memory creation system
- Multiple dialogue outcomes

### Technical Integration:
- Video player interface for raid footage
- Gate selection modals
- Performance analysis systems
- State management for relationship progression
- Modal-based activity interfaces

## DUPLICATE ACTIVITIES FOUND:

### Coffee Activities (3 duplicates):
1. **`grab_coffee`** (DailyLifeHubComplete.tsx, DailyLifeHubModal.tsx)
2. **`hongdae_cafe`** (DailyLifeHubSystem4.tsx, WorldMapSystem8.tsx)
3. **`morning_coffee`** (DailyLifeHubModal.tsx, daily-life-hub.tsx)

All three are essentially coffee date activities with similar mechanics.

### Raid Activities (3 duplicates):
1. **`review_raid_footage`** (DailyLifeHubComplete.tsx - appears twice)
2. **`clear_low_rank_gate`** (DailyLifeHubComplete.tsx - appears twice)
3. **`solo_raid`** vs **`joint_raid`** (similar mechanics, different participants)

### Shopping Activities (2 duplicates):
1. **`shopping_for_gifts`** (DailyLifeHubComplete.tsx)
2. **`shopping_together`** (DailyLifeHubSystem4.tsx)

Both involve shopping with gold requirements.

### Walking Activities (2 duplicates):
1. **`hangang_walk`** (DailyLifeHubComplete.tsx)
2. **`hangang_walk`** (DailyLifeHubSystem4.tsx)

Same activity ID in different components.

## CONSOLIDATION RECOMMENDATIONS:

1. **Merge Coffee Activities**: Keep one coffee activity with time-of-day variants
2. **Consolidate Raid Activities**: Combine review/clear functions into single activity
3. **Unify Shopping**: Single shopping activity with different location options
4. **Remove Duplicate Components**: Several activities exist in multiple component files

## Notes for Audit:
- CRITICAL: Multiple duplicate activities across different components
- Activities are distributed across four main categories
- Progressive unlocking based on affection levels
- Mix of casual, professional, and intimate content
- Integration with combat/raid systems
- Memory and relationship milestone tracking
- Content gating ensures appropriate progression