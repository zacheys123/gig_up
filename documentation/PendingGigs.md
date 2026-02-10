Gig Applications System Documentation
📋 Overview

The Gig Applications System manages how users interact with gigs (music events) through various engagement states. Users can show interest, apply for roles, get shortlisted, and track completed gigs.
🔗 Data Relationships
User-Gig Relationship Map
text

User ────┐
├──► Interested ────► Regular Gig
├──► Applied ───────► Band Role (vocalist, dj, guitar, etc.)
├──► Shortlisted ──► Full Band Application
└──► History ──────► Completed Gigs

Gig Types & User Involvement
text

1. REGULAR GIGS
   └── User in `interestedUsers` array
   └── Status: "interested" or "shortlisted"

2. BAND-ROLE GIGS
   └── User in `bandCategory[index].applicants` array
   └── Status: "applied" or "shortlisted"
   └── Roles: vocalist, dj, mc, guitar, drums, piano, bass, saxophone, trumpet

3. FULL-BAND GIGS
   └── User in `bookCount[index].appliedBy`
   └── Status: "applied" or "shortlisted"
   └── Band application with multiple members

4. HISTORICAL GIGS
   └── User in `bookingHistory` with completed status
   └── Status: "completed"

📊 Data Flow
How Applications Are Categorized
typescript

// 1. QUERY: getAllActiveGigs()
// └── Filters: isActive = true

// 2. For EACH gig, check user involvement:
if (userInGig) {
// 3. Determine status & type:
switch(detectionMethod) {
case "interestedUsers.includes(userId)":
status = "interested" | "shortlisted"
type = "regular"

    case "bandCategory.applicants.includes(userId)":
      status = "applied" | "shortlisted"
      type = "band-role"
      role = bandRole (e.g., "vocalist")

    case "bookCount.appliedBy === userId":
      status = "applied" | "shortlisted"
      type = "full-band"
      bandName = fetched from bands table

    case "bookingHistory.userId === userId":
      status = "completed"
      type = "history"
      isHistorical = true

}

// 4. Add to categorized arrays
result.all.push(gigWithUserData)

if (isHistorical) {
result.history.push(gigWithUserData)
} else {
result[status].push(gigWithUserData) // interested/applied/shortlisted
}
}

Tab Categorization Logic
typescript

// TABS & THEIR DATA SOURCES
const TABS = {
"all": result.all, // All gigs user is involved in
"interested": result.interested, // Only "interested" status
"applied": result.applied, // Only "applied" status
"shortlisted": result.shortlisted, // Only "shortlisted" status  
 "history": result.history // Completed/historical gigs
}

// SORTING LOGIC
all/interested/applied/shortlisted → Sort by: createdAt (newest first)
history → Sort by: completedDate (newest first)

🎯 User Status Progression
text

Timeline View:
INTERESTED → APPLIED → SHORTLISTED → BOOKED → COMPLETED
│ │ │ │ │
│ │ │ │ └── History Tab
│ │ │ │
│ │ │ └── Not shown (future enhancement)
│ │ │
│ │ └── Shortlisted Tab
│ │
│ └── Applied Tab
│
└── Interested Tab

🏷️ Status Badges & Icons
Status Badge Mapping
Status Badge Color Icon Label Example
interested Blue ❤️ Heart "Shown Interest"
applied Yellow 💼 Briefcase "Applied: Vocalist"
shortlisted Green ⭐ Star "Shortlisted: DJ"
completed Gray 📜 History "Completed"
Gig Type Icons
Gig Type Icon Color
Regular 💼 Briefcase Blue
Band-Role (vocalist) 🎤 Mic Pink
Band-Role (dj) 🔊 Volume2 Purple
Band-Role (guitar) 🎵 Music Blue
Full-Band 👥 Users2 Orange
History 📜 History Gray
🔍 Search Filter Logic
typescript

// SEARCHABLE FIELDS
searchQuery.toLowerCase() matches:

1. gig.title
2. gig.location
3. gig.applicationDetails.role (for band roles)
4. gig.bussinesscat (gig category)
5. gig.applicationDetails.status (for history)

// ACTIVE TAB FILTERING
Tab filters applied BEFORE search:

- "all": No filter
- "interested": status === "interested"
- "applied": status === "applied"
- "shortlisted": status === "shortlisted"
- "history": isHistorical === true

📱 Display Modes

1. Timeline View (Default)
   text

┌── ● 2024-01-15
│ ├── 🎤 Vocalist Application
│ ├── ⭐ Shortlisted
│ └── 📍 Nairobi, $200
│
├── ● 2024-01-10  
│ ├── 💼 Regular Gig
│ ├── ❤️ Interested
│ └── 📍 Mombasa, $150
│
└── ● 2024-01-05
├── 📜 Completed Gig
├── ✅ Paid: $300
└── ⭐ Rating: 4.5/5

2. Grid View
   text

┌────────────┐ ┌────────────┐ ┌────────────┐
│ 🎤 Vocalist│ │ 🔊 DJ │ │ 📜 History │
│ ⭐ Shortlisted││ 💼 Applied ││ ✅ Completed│
│ $200 │ │ $250 │ │ $300 │
└────────────┘ └────────────┘ └────────────┘

3. Kanban View
   text

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Interested │ Applied │ Shortlisted │ History │
│ (3) │ (5) │ (2) │ (4) │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ❤️ Gig A │ 💼 Gig B │ ⭐ Gig C │ 📜 Gig D │
│ ❤️ Gig E │ 💼 Gig F │ ⭐ Gig G │ 📜 Gig H │
│ ❤️ Gig I │ 💼 Gig J │ │ 📜 Gig K │
│ │ 💼 Gig L │ │ 📜 Gig M │
└──────────────┴──────────────┴──────────────┴──────────────┘

4. List View
   text

1. 🎤 Wedding Singer | ⭐ Shortlisted | Jan 15 | Nairobi | $200
1. 🔊 Club DJ | 💼 Applied | Jan 14 | Mombasa | $250
1. 📜 Corporate Event | ✅ Completed | Jan 10 | Nairobi | $300

1. Calendar View
   text

January 2024
Mon Tue Wed Thu Fri Sat Sun
1 2 3 4 5 📜6 7
8 9 📜10 11 12 13 14
🎤15 🔊16 17 18 19 20 21
22 23 24 25 26 27 28
29 30 31

⚙️ Technical Implementation
Hook Structure
typescript

// Primary Hook
useGigs({
userId: string,
gigId?: string,
limit?: number,
filters?: {category, dateRange, price}
})

// Specialized Hooks
useUserGigs(userId) // User's created gigs
useExploreGigs(limit) // Browse gigs
useGigDetails(gigId) // Single gig details
useUserApplications(userId) // User's applications (categorized)

Convex Query Output Structure
json

{
"all": [
{
"_id": "gig123",
"title": "Wedding Singer Needed",
"userStatus": "shortlisted",
"gigType": "band-role",
"applicationDetails": {
"type": "band-role",
"role": "vocalist",
"roleSlots": "1/2"
},
"isHistorical": false,
"date": 1705344000,
"location": "Nairobi",
"price": 200
}
],
"interested": [...],
"applied": [...],
"shortlisted": [...],
"history": [...]
}

🎨 UI/UX Features
Stats Cards

    Total Involved: Count of result.all

    Interested: Count of result.interested

    Applied: Count of result.applied

    Shortlisted: Count of result.shortlisted

    History: Count of result.history

Interactive Elements

    View Details: Navigates to gig page

    Message: Opens chat with gig poster

    Withdraw: Removes from interested list

    Rating: View completed gig rating

    Receipt: View payment details (historical)

🚀 Performance Optimizations

    Server-side Categorization: All sorting/filtering done in Convex

    Memoization: React hooks memoize expensive computations

    Lazy Loading: Images and heavy components load on demand

    Virtual Scrolling: For large lists (future enhancement)

🔧 Troubleshooting Guide
Common Issues & Solutions
Issue Solution
"No gigs found" Check user ID, ensure gigs are isActive: true
Missing band names Update bandApplicationEntry schema with bandName
Type errors Ensure TypeScript interfaces match Convex schema
Slow loading Add indexes on isActive, userId fields
Debugging Flow
text

1. Check user ID is valid
2. Verify gig has user in: interestedUsers, bandCategory.applicants, bookCount, or bookingHistory
3. Confirm gig.isActive === true
4. Check categorization logic matches user status
5. Verify search filters aren't excluding all results

📈 Future Enhancements

    Real-time updates when gig status changes

    Push notifications for application updates

    Advanced filtering by date, price range, location radius

    Export functionality to CSV/PDF

    Mobile-optimized touch interactions

    Analytics dashboard for application success rates

🎯 Key Takeaways

    Single Source of Truth: All categorization happens in Convex query

    Consistent UI: Same data structure powers all display modes

    Scalable Architecture: Separate concerns between data fetching and UI

    User-Centric Design: Clear progression from interest to completion

    Type Safety: Full TypeScript coverage prevents runtime errors

This system provides musicians with a comprehensive view of their gig applications across all engagement levels, helping them track opportunities and manage their performance calendar effectively.
