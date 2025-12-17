# Learn Buddy Design Guidelines

## Design Approach

**Hybrid Strategy**: Drawing inspiration from gamified learning apps (Duolingo, Habitica) combined with modern productivity tools for clean information architecture. The design balances playful engagement with professional learning effectiveness.

**Key References**:
- Duolingo: Gamification patterns, progress visualization, encouraging feedback
- Pokemon Go/Tamagotchi: Creature care mechanics, evolution visuals
- Notion: Clean typography, card-based layouts, status indicators
- Linear: Crisp spacing, subtle animations, status visualization

## Typography System

**Font Families**: 
- Primary: Quicksand (playful, rounded, friendly) for headings and creature-related content
- Secondary: Inter (clean, professional) for body text, learning content, and data

**Hierarchy**:
- Creature name/status: text-2xl to text-3xl, font-medium (Quicksand)
- Section headers: text-xl, font-semibold (Quicksand)
- Body/facts/questions: text-base, font-normal (Inter)
- Stats/numbers: text-lg, font-semibold tabular numbers
- Micro-labels: text-sm, text-gray-600

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component internal padding: p-4, p-6
- Section spacing: space-y-6, gap-8
- Screen margins: px-4 (mobile), px-6 (tablet), px-8 (desktop)
- Card padding: p-6
- Button padding: px-6 py-3

**Container Strategy**:
- Mobile-first: Full width with px-4 margins
- Desktop max-width: max-w-6xl mx-auto for main content
- Side panels (leaderboards): max-w-sm

## Core Components

### Home Screen (Creature Habitat)
**Layout**: Full-height viewport split into three zones
- Top bar (h-16): User avatar (left), XP/Level badge, streak counter (flame icon + number)
- Center habitat (flex-1): Creature illustration with subtle animated background, happiness meter (arc gauge above creature), health status indicator (emoji + text)
- Bottom action dock (h-24): Three primary buttons in grid (Feed, Play, Care) with icon + label stacks

**Creature Display**: Large centered illustration (60-70% of available height), floating shadow effect, breathing animation (subtle scale pulse)

### Flashcard Interface
**Layout**: Card-based swipe interface
- Full-screen card (rounded-2xl, shadow-xl) with generous padding (p-8)
- Top: Category badge, progress indicator (3/20 cards)
- Center: Question/fact text (text-xl, leading-relaxed)
- Bottom: Swipe hint arrows, confidence indicators
- Card stack visual: Next 2 cards partially visible behind (scaled and translated)

### Quiz Session
**Layout**: Vertical flow with fixed header/footer
- Header: Progress bar (full width), question counter, timer (if timed)
- Question card: p-8, question text (text-lg, font-medium), spacing below (mb-6)
- Answer options: Stack of 4 buttons (space-y-3), each with p-4, text-left, full width
- Footer: Skip button (text-sm, text-gray-500)

**Answer States**: Correct (green accent border-l-4), Incorrect (red accent border-l-4), Selected (border-2)

### Learning Hub (Tab Navigation)
**Layout**: Top tab bar + content area
- Tab bar: Horizontal scroll on mobile, flex wrap on desktop, each tab (px-6 py-3)
- Content area: Padded container (p-6), cards grid for mini-games (grid-cols-1 md:grid-cols-2 gap-6)
- Each learning mode card: Icon (top-left), title, description (2 lines), CTA button, stats (facts completed)

### Progress Dashboard
**Layout**: Multi-section scroll view
- Hero stats card: Grid of 4 metrics (2x2 on mobile, 4x1 on desktop) - facts mastered, current streak, level, XP to next
- Evolution timeline: Horizontal scroll of 3 stages, current stage highlighted, future stages locked/grayed
- Achievement grid: 3-column grid (grid-cols-3 gap-4), each badge as rounded card with icon + title
- Graph section: Line chart showing daily facts learned (last 30 days)

### Leaderboard
**Layout**: List with ranking visualization
- Filter tabs: Global, Store, Friends (mb-6)
- User entries: Each row with rank badge (left), avatar + name (flex-1), XP score (right, font-semibold)
- Current user highlight: Background accent, sticky position when scrolling
- Top 3: Larger size, medal icons, special background treatment

### Accessory Shop
**Layout**: Grid catalog with preview
- Category filters: Horizontal pill buttons (Hats, Accessories, Decorations)
- Product grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4, gap-6
- Each item card: Image preview, name, price (Knowledge Gems icon + number), "Equip" button
- Preview modal: Creature wearing selected item, large centered view, confirm/cancel buttons

### Profile Screen
**Layout**: Header + sections
- Profile header: Large creature avatar (center), username below, level badge
- Stats grid: 2x2 metrics (Total Facts, Streak, Achievements, Hours Learned)
- Recent badges: Horizontal scroll of latest 5 achievements
- Settings access: Gear icon (top-right)

## Component Library

**Buttons**:
- Primary: Rounded-full, px-6 py-3, font-medium, shadow-md, with icon option
- Secondary: Rounded-full, px-6 py-3, border-2, transparent background
- Icon-only: Square/circle, p-3, centered icon

**Cards**:
- Standard: rounded-2xl, shadow-lg, p-6, background white
- Interactive: Hover lift effect (transform translateY), cursor-pointer
- Status cards: Border-l-4 with status color accent

**Progress Indicators**:
- Linear bar: h-2, rounded-full, animated width transition
- Circular/arc: SVG-based, animated stroke-dashoffset
- Meter fills: Smooth gradient fills with glow effect

**Badges/Pills**:
- Small: px-3 py-1, rounded-full, text-xs, font-medium
- Large: px-4 py-2, rounded-full, text-sm, font-semibold

**Input Fields** (for quizzes/forms):
- Rounded-lg, p-4, border-2, focus ring-2 effect
- Labels: text-sm, font-medium, mb-2

**Modal Overlays**:
- Backdrop: bg-black/50, backdrop-blur-sm
- Modal: max-w-lg, rounded-2xl, p-8, shadow-2xl, slide-up animation

## Animations

**Micro-interactions** (use sparingly):
- Button press: Scale 0.95 on active
- Card hover: Lift (translateY -2px), shadow increase
- Success feedback: Bounce animation, confetti particles
- Creature feeding: Scale pulse, happy bounce

**Transitions**:
- Page/modal entry: Slide-up with fade (300ms)
- Tab switching: Crossfade (200ms)
- Progress updates: Smooth count-up numbers

**Creature States**:
- Idle: Gentle breathing (scale 1.0 to 1.02)
- Happy: Bounce on feed, sparkle particles
- Sad: Droop animation, reduced opacity

## Images

**Creature Illustrations**: Custom-designed creature in 3 evolution stages, SVG or high-res PNG with transparency. Placed centrally in habitat view, sized to fill 60-70% of container height. Background habitat with subtle parallax layers (clouds, grass).

**Achievement Badges**: Icon-based illustrations, 128x128px, consistent style. Each badge has unique visual but maintains rounded aesthetic.

**Mini-game Thumbnails**: Illustrated previews showing game mechanic, 16:9 ratio, placed in learning hub cards.

**Empty States**: Friendly illustrations for "no achievements yet", "complete your first flashcard", soft pastel style matching overall theme.

## Accessibility

- Focus rings: ring-2 ring-offset-2 on all interactive elements
- Color contrast: Minimum 4.5:1 for all text
- Touch targets: Minimum 44x44px for all buttons
- Screen reader labels: All icons have aria-labels
- Keyboard navigation: Full tab order, escape to close modals