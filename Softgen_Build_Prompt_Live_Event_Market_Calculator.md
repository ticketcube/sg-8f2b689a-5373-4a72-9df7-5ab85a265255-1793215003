Build a polished, mobile-responsive web application called **Live Event Market Calculator**.

This is an educational hands-on tool for learning how senior live-event marketing decisions are made. It should simulate the commercial marketing planning process for a touring live entertainment event where the primary objective is to maximize **incremental ticket sales, attendance, and revenue**.

The application should NOT simply be a basic advertising ROI calculator. It should function as a simplified **event marketing decision engine** that connects ticket economics, sales pacing, audience assumptions, media mix, conversion, and marketing ROI.

## PRODUCT OBJECTIVE

The user enters assumptions about a live event and a specific market.

The application calculates:

- Ticket revenue opportunity
- Tickets required to hit the sales target
- Current sales pace
- Projected final attendance
- Marketing budget
- Required incremental ticket sales
- Allowable cost per ticket
- Media-channel allocation
- Estimated impressions/reach/clicks/conversions
- Estimated incremental ticket sales
- Revenue generated
- ROAS
- Marketing efficiency
- Gap to target
- Recommended marketing action

The application should help the user understand the relationship between:

**MEDIA → AUDIENCE → TRAFFIC → CONVERSION → TICKETS → REVENUE**

and, critically:

**TICKET VELOCITY → MARKETING DECISION**

---

# TECH STACK

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase only if persistence is useful
- Recharts for charts
- Responsive desktop/tablet/mobile design

Keep the application simple enough to build quickly but architect it so additional functionality can be added later.

---

# CORE USER FLOW

The application should have four major sections:

1. EVENT ECONOMICS
2. SALES PACING
3. MEDIA PLAN
4. RESULTS & RECOMMENDATIONS

Use a clean professional dashboard aesthetic appropriate for a senior live entertainment executive.

Avoid making it look like a consumer ticket-buying site.

---

# SECTION 1 — EVENT ECONOMICS

Create an input form with:

### Event

- Event Name
- Artist / Production
- Market / City
- Venue
- Event Date

### Ticket Economics

- Venue Capacity
- Target Sell-Through %
- Current Tickets Sold
- Average Ticket Price
- Premium Ticket %
- Premium Ticket Price
- Standard Ticket Price
- Current Gross Ticket Revenue
- Target Gross Ticket Revenue

Calculate automatically:

### Total Ticket Revenue Potential

Venue Capacity × Average Ticket Price

### Target Tickets

Venue Capacity × Target Sell-Through %

### Tickets Remaining

Target Tickets − Current Tickets Sold

### Current Sell-Through

Current Tickets Sold ÷ Venue Capacity

### Revenue Remaining

Target Gross Revenue − Current Gross Revenue

Display these prominently.

---

# SECTION 2 — SALES PACING

Create a "Days to Show" input.

Calculate:

- Days until event
- Current sales velocity
- Required daily ticket sales
- Required weekly ticket sales
- % of target sold
- % of target remaining

Allow the user to select a pacing status:

- Ahead of Pace
- On Pace
- Slightly Behind
- Significantly Behind

Also calculate automatically where possible.

Create a simple sales pacing chart showing:

### Actual Sales
vs.
### Target Sales

over the remaining campaign period.

Allow the user to enter historical/comparable pacing assumptions.

Inputs:

- Expected organic sales per day
- Historical comparable sell-through %
- Historical comparable sales velocity

---

# SECTION 3 — MEDIA PLAN

This is one of the most important parts of the application.

Create a media planning interface covering BOTH traditional and digital paid media.

Media channels:

### TV / CTV

Inputs:

- Budget
- CPM
- Expected conversion rate

### RADIO / AUDIO

Inputs:

- Budget
- CPM
- Expected conversion rate

### OOH

Inputs:

- Budget
- CPM
- Expected conversion rate

### PAID SOCIAL

Inputs:

- Budget
- CPM
- CTR
- Conversion Rate

### PAID SEARCH

Inputs:

- Budget
- CPC
- Conversion Rate

### DISPLAY / PROGRAMMATIC

Inputs:

- Budget
- CPM
- CTR
- Conversion Rate

### YOUTUBE / VIDEO

Inputs:

- Budget
- CPM
- CTR
- Conversion Rate

### RETARGETING

Inputs:

- Budget
- CPC
- Conversion Rate

Also include:

### CRM / EMAIL

Inputs:

- Audience Size
- Expected Open Rate
- Click Rate
- Conversion Rate

CRM should be treated as an owned channel rather than paid media.

---

# MEDIA CALCULATIONS

For CPM-based channels:

Impressions = Budget / CPM × 1,000

For CPC channels:

Clicks = Budget / CPC

For CTR-based channels:

Clicks = Impressions × CTR

For conversion-based channels:

Conversions = Clicks × Conversion Rate

For CRM:

Opens = Audience × Open Rate

Clicks = Opens × Click Rate

Conversions = Clicks × Conversion Rate

Treat conversions as estimated ticket purchases.

Calculate for every channel:

- Budget
- Impressions
- Clicks
- Estimated Ticket Purchases
- Cost Per Ticket
- Revenue
- ROAS

---

# IMPORTANT: MEDIA MIX

Create a media mix table:

| Channel | Budget | % Budget | Impressions | Clicks | Tickets | CPT | Revenue | ROAS |

Show totals at the bottom.

Create a pie/donut chart showing budget allocation by channel.

Create a bar chart showing estimated ticket contribution by channel.

---

# SECTION 4 — RESULTS & RECOMMENDATIONS

Create an executive summary dashboard.

Show:

### TICKETS

- Current Tickets Sold
- Target Tickets
- Incremental Tickets Required
- Estimated Marketing-Driven Tickets
- Projected Final Tickets

### REVENUE

- Current Revenue
- Target Revenue
- Projected Revenue
- Incremental Revenue

### MARKETING

- Total Marketing Budget
- Estimated Marketing-Driven Tickets
- Blended Cost Per Ticket
- ROAS

### ATTENDANCE

- Projected Attendance
- Target Attendance
- Projected Sell-Through

Use large KPI cards.

---

# MARKETING DECISION ENGINE

This is critical.

The application should automatically interpret the results and provide a recommendation.

Examples:

### GREEN — AHEAD OF PACE

If projected sales >= target:

"Market is currently pacing ahead of target. Maintain core media investment and test whether budget can be shifted toward higher-performing channels or reserved for final-week demand capture."

### YELLOW — SLIGHTLY BEHIND

If projected sales are 5–15% below target:

"Market is below target but recoverable. Reallocate budget toward channels producing the lowest cost per incremental ticket and strengthen retargeting/search/CRM."

### ORANGE — SIGNIFICANTLY BEHIND

If projected sales are 15–25% below target:

"Market requires intervention. Diagnose whether the issue is awareness, audience, conversion, pricing, inventory, or product positioning before simply increasing media spend."

### RED — SEVERELY BEHIND

If projected sales are >25% below target:

"Market is materially underperforming. Increasing media alone may not solve the problem. Evaluate pricing, offer strategy, venue capacity, event positioning, audience-market fit, competitive calendar and inventory before increasing spend."

---

# VERY IMPORTANT MARKETING LOGIC

Do NOT assume that increasing marketing spend automatically increases ticket sales.

The application should explicitly teach:

### Demand Creation

TV
Radio
OOH
Video
Paid Social
PR
Influencers
Partnerships

### Demand Capture

Search
Retargeting
CRM
Ticketing platforms

Explain visually that these serve different roles.

---

# INCREMENTALITY

Include an optional "Incrementality Adjustment" input for each paid channel.

Example:

Meta:

Attributed tickets = 1,000

Incrementality factor = 60%

Estimated incremental tickets = 600

This teaches the distinction between:

### ATTRIBUTION

"What received credit for the sale?"

and

### INCREMENTALITY

"How many additional sales were actually caused by marketing?"

Show both numbers.

---

# MARKETING BUDGET OPTIMIZER

Add a button:

**"OPTIMIZE MEDIA MIX"**

When clicked, the application should identify channels with the best estimated:

- Cost Per Ticket
- ROAS
- Incremental Ticket Contribution

Then recommend reallocating budget from weaker channels toward stronger channels.

Do not blindly move all budget to the highest-performing channel.

Maintain reasonable minimum/maximum allocation constraints.

For example:

- No single channel > 40% of total budget
- At least 3 channels must remain active
- Maintain some awareness media even if direct conversion is lower

Explain the recommendation.

Example:

"Recommended reallocation: move $15,000 from OOH to Paid Social and Search because current assumptions indicate stronger incremental ticket efficiency."

---

# MARKET SCENARIO TESTING

Create a scenario selector:

### BASE CASE

Normal assumptions.

### UPSIDE

Higher conversion / stronger organic demand.

### DOWNSIDE

Lower conversion / weaker demand.

### AGGRESSIVE MARKETING

Higher marketing spend.

### LOW MEDIA

Reduced marketing spend.

Allow the user to compare scenarios side-by-side.

Display:

- Tickets
- Revenue
- Marketing Spend
- CPT
- ROAS
- Sell-through

---

# MARKET COMPARISON

Allow multiple markets/events to be saved.

Create a table:

| Market | Capacity | Sold | Target | Pace | Marketing Spend | CPT | ROAS | Status |

Example markets:

Los Angeles
Denver
New York
Chicago
Austin
San Francisco

The user should be able to identify which markets need attention.

---

# MARKET COLORS

Use:

Green = ahead/on target

Yellow = slightly behind

Orange = needs intervention

Red = materially behind

Do not use excessive colors elsewhere.

---

# EXECUTIVE INSIGHT PANEL

At the top of the results page, generate 3–5 plain-English insights.

Examples:

"Los Angeles is pacing 12% ahead of target."

"Paid Search is currently producing the lowest estimated cost per ticket."

"OOH generates significant awareness but has lower directly attributable ticket efficiency."

"18,500 incremental tickets are required to reach the target."

"Current media budget is insufficient to close the projected ticket gap at the modeled acquisition cost."

These insights should update dynamically based on the inputs.

---

# MARKETING DIAGNOSTIC

Add a section called:

## "WHY IS THIS MARKET BEHIND?"

The user should be able to select:

- Low awareness
- Low website traffic
- Low conversion
- Wrong audience
- Pricing issue
- Inventory issue
- Competitive event/calendar issue
- Weak creative
- Insufficient media
- Unknown

Then provide a corresponding recommended action.

Example:

If "Low traffic":

"Increase qualified demand generation through paid social, video, OOH, radio, partnerships and PR."

If "High traffic / low conversion":

"Investigate pricing, creative, landing-page experience, social proof, offer and inventory."

If "Good conversion / low traffic":

"Increase qualified traffic and demand capture."

If "Strong sales / weak remaining inventory":

"Reduce broad awareness spend and concentrate on high-intent demand capture."

---

# EDUCATIONAL MODE

Because this application is being used as a five-day live-event marketing learning exercise, add an optional toggle:

**LEARNING MODE: ON/OFF**

When ON, explain important calculations.

For example:

### Cost Per Ticket

"Marketing spend divided by incremental tickets generated."

### ROAS

"Ticket revenue generated divided by marketing spend."

### Ticket Velocity

"How quickly tickets are being sold over time."

### Pacing

"Current sales performance compared with the expected sales curve."

### Incrementality

"Estimated portion of attributed sales that would not have happened without marketing."

The explanations should be concise.

---

# NOVA-STYLE PRACTICE SCENARIO

Pre-load one example scenario for practice.

Event:

**DroneArt: Four Seasons**

Market:

**Los Angeles**

Capacity:

**5,000**

Target Sell-Through:

**90%**

Average Ticket Price:

**$100**

Current Tickets Sold:

**2,750**

Days to Event:

**35**

Marketing Budget:

**$150,000**

Use clearly labeled SAMPLE / EDUCATIONAL assumptions.

Do NOT represent these numbers as actual Nova data.

Allow the user to change every assumption.

---

# DESIGN

Use a sophisticated executive dashboard.

Think:

- Live entertainment
- Revenue management
- modern SaaS analytics
- premium consulting dashboard

Avoid:

- overly colorful consumer design
- unnecessary animation
- excessive cards
- gimmicky graphics

Prioritize:

- readability
- numbers
- charts
- clear recommendations
- fast interaction

The user should be able to change an assumption and immediately see how the business outcome changes.

---

# IMPORTANT ARCHITECTURAL PRINCIPLE

Separate the application into:

1. Input assumptions
2. Calculation engine
3. Visualization
4. Recommendation engine

Do not hard-code calculations directly into UI components.

Create reusable calculation functions so the model can be expanded later.

---

# FUTURE FEATURES — DO NOT BUILD YET

Architect so these can eventually be added:

- Ticketmaster API
- real ticket sales data
- Google Ads data
- Meta Ads data
- CRM data
- venue data
- historical event benchmarks
- weather
- competitive event calendars
- dynamic pricing
- machine-learning demand forecasts
- actual attribution data
- geographic audience mapping
- AI-generated marketing recommendations

Do not implement these now.

---

# FINAL REQUIREMENT

The application should feel like a simplified version of the internal tool a Senior Event Marketing Director could use in a weekly market-performance meeting.

The core question the application should help answer is:

> **"Given where ticket sales are today, how much incremental demand do we need, where should we spend the next marketing dollar, and what should we do if the market is not pacing to target?"**

Build the complete functional MVP rather than a static mockup.

Seed the application with realistic sample data so it is immediately usable after launch.