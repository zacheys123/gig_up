📊 Left Column Platform Activity - Complete Documentation
Overall Layout Structure
The left column is a fixed, sticky sidebar that displays platform-wide gig activity in three distinct sections stacked vertically:

text
┌─────────────────────────────────┐
│ SECTION 1: Market Pulse │ ← Live activity feed (purple theme)
│ • Live market ticker │
│ • Quick filters │
│ • Activity cards │
│ • Live footer stats │
├─────────────────────────────────┤
│ SECTION 2: Opening Soon │ ← Application windows (indigo theme)
│ • Countdown timer │
│ • Upcoming gig cards │
│ • "View all" link │
├─────────────────────────────────┤
│ SECTION 3: Market Stats │ ← Quick metrics (neutral theme)
│ • Demand % │
│ • Average bid │
│ • Total openings │
└─────────────────────────────────┘
📍 SECTION 1: Market Pulse (Top)
Purpose
Shows real-time platform activity and trending gigs

Data Sources
Component Data Source Description
Active Gigs Count allGigsData?.length Total number of active gigs on platform
Market Ticker Mock data Simulated market indicators (+2.4%, demand level, avg bid)
Quick Filters UI state activeTab state for filtering views
Activity Cards allGigsData.slice(0, 6) First 6 gigs from all gigs data
Gig Stats gig.interestedUsers?.length Number of interested users per gig
Gig Stats gig.appliedUsers?.length Number of applied users per gig
Timestamp gig.\_creationTime When gig was created (passed to formatTimeAgo)
Price gig.price, gig.currency Gig budget information
Live Footer Mock + real-time Volume (mock), current time (real)
Data Flow
typescript
allGigsData → filter → map → display in cards
→ count → display in badge
→ calculate timestamps → formatTimeAgo()
📍 SECTION 2: Opening Soon (Middle)
Purpose
Shows gigs that will open for applications soon (based on acceptInterestStartTime)

Data Sources
Component Data Source Description
Section Badge upcomingGigs.length Count of upcoming gigs
Countdown Timer upcomingGigs[0]?.acceptInterestStartTime Time until next gig opens
Gig Cards upcomingGigs.slice(0, 4) First 4 upcoming gigs
Days Until Calculated (startTime - now) / (1000*60*60*24)
Hours Until Calculated (startTime - now) / (1000*60\*60)
Opening Date gig.acceptInterestStartTime When applications open
Location gig.location Gig location
Waitlist gig.interestedUsers?.length People waiting for this gig
Data Filtering Logic
typescript
// Filter criteria for upcoming gigs
const upcoming = allGigsData.filter(gig =>
gig.\_id !== gigId && // Exclude current gig
gig.acceptInterestStartTime && // Has opening time
gig.acceptInterestStartTime > now && // Not opened yet
!gig.isTaken && // Not taken
gig.isActive !== false // Is active
);
📍 SECTION 3: Market Stats (Bottom)
Purpose
Quick platform metrics at a glance

Data Sources
Metric Data Source Current Value
DEMAND Mock/Calculated ↑ 23% (simulated market demand)
AVG BID Mock/Aggregated $450 (average gig price)
OPENINGS Calculated 12 (active gigs count)
Future Enhancement
These stats should be calculated from real data:

DEMAND = % increase in applications vs last week

AVG BID = Average of all gig prices

OPENINGS = allGigsData?.length

🔄 Data Flow Summary
Primary Data Source
typescript
const { allGigs: allGigsData } = useAllGigs({ limit: 100 });
Derived Data
typescript
// Upcoming gigs (filtered)
const [upcomingGigs, setUpcomingGigs] = useState<PlatformGig[]>([]);

useEffect(() => {
if (!allGigsData) return;
const now = Date.now();
const upcoming = allGigsData.filter(...);
setUpcomingGigs(upcoming);
}, [allGigsData, gigId]);
UI State
typescript
const [activeTab, setActiveTab] = useState("trending"); // For quick filters
🎨 Visual Hierarchy
Section Theme Purpose
Market Pulse Purple Live, dynamic, real-time
Opening Soon Indigo Future, anticipatory
Market Stats Neutral Static, summary
Each section has:

Distinct color scheme

Unique icon set

Specific typography scale

Individual interaction patterns

📱 Responsive Behavior
Desktop (md+): Full three-section sticky sidebar

Mobile: Hidden, accessible via bottom drawer

Sticky positioning: sticky top-24 keeps it fixed while scrolling

🎯 Key Features
Live Indicators: Pulsing dots, animated counters

Hover Effects: Cards expand/slide on hover

Real-time Updates: Timestamps, countdown timers

Quick Filtering: Three filter options for activity view

Scrollable Content: Limited height with custom scrollbars

Visual Feedback: Color-coded status indicators

This left column creates a complete market intelligence dashboard that feels separate from the main gig details! 🚀
