# CARD//OS — MASTER BUILD CONTROLLER
## Complete Web Application Specification

You are building **CARD//OS**, a premium futuristic credit-card optimization web application.

Your job is to progressively build this application through the phases defined below.

---

# MASTER EXECUTION RULE

## DO NOT BUILD ALL PHASES AT ONCE.

Execute **ONLY ONE PHASE per interaction**.

At the beginning of every interaction:

1. Inspect the existing project.
2. Read the current project state.
3. Determine the last completed phase.
4. Identify the next incomplete phase.
5. Execute ONLY that phase.
6. Test the work.
7. Fix errors.
8. Preserve all previously working functionality.
9. Update the project status.
10. STOP.

Do not automatically continue into the next phase.

When the user says:

> Continue

execute the next incomplete phase.

If the user asks for changes to the current phase, make those changes without advancing to the next phase.

---

# CRITICAL PRESERVATION RULE

Before modifying anything:

> **Inspect the existing application and understand its architecture.**

Never unnecessarily rebuild or replace existing functionality.

Never remove working functionality from previous phases.

Never redesign an existing component merely because a new phase introduces additional functionality.

Extend the existing architecture.

If an architectural change is genuinely required, preserve backward compatibility.

---

# MASTER SPECIFICATION FILE

This file is named:

`CARD_OS_MASTER_BUILD.md`

It is the authoritative product and development specification.

**Never delete, overwrite, truncate, or modify this file unless the user explicitly asks you to change the specification.**

Consult this file before every phase.

Maintain project implementation status separately from this specification, preferably in:

`PROJECT_STATUS.md`

or an equivalent machine-readable project status file.

---

# PROJECT IDENTITY

## Name

CARD//OS

## Tagline

> Your credit card operating system.

## Core concept

CARD//OS helps users determine:

> **Which credit card should I use for this purchase?**

The application considers:

- Card reward rules
- Cashback
- Reward points
- Miles
- Merchant
- Purchase category
- Reward caps
- Current cap utilization
- Offers
- Milestones
- User reward preferences
- Redemption value

The result should be:

> **The card that provides the highest effective value for THIS user and THIS purchase.**

This is NOT simply a credit-card comparison website.

---

# V1 PRODUCT CONSTRAINTS

V1 must be:

- Browser-only
- Free to operate
- No backend required
- No authentication
- No banking integrations
- No card numbers
- No CVV
- No PIN
- No OTP
- No paid APIs
- No paid databases

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide
- Recharts where appropriate
- IndexedDB/localStorage for user data
- Static JSON for initial card data

The architecture must remain ready for future:

- accounts
- cloud synchronization
- backend
- bank integrations
- browser extension
- AI APIs
- remote card database
- global countries

---

# MARKET

Launch market:

## India

However, architecture must be global.

Every relevant entity should support:

- country
- currency
- issuer
- card
- reward currency
- merchant ecosystem
- rules

The system should eventually support countries such as:

- India
- USA
- UK
- UAE
- others

Do not hard-code India into the core business logic.

---

# DESIGN PHILOSOPHY

Create a:

# PREMIUM FUTURISTIC FINTECH EXPERIENCE

Visual inspiration:

- Apple
- Linear
- Stripe
- futuristic AI command centers
- premium fintech products

The experience should feel like:

> **A financial product from 2030.**

But it must remain trustworthy and highly readable.

Do NOT create:

- gaming UI
- crypto-style UI
- excessive neon
- excessive glowing effects
- cluttered dashboards
- generic banking UI

---

# VISUAL DESIGN

Primary theme:

## Dark mode

Use:

- near-black backgrounds
- charcoal surfaces
- glass/translucent panels
- subtle gradients
- soft borders
- restrained accent colors
- elegant shadows
- subtle glow

Colors should communicate meaning:

Green = healthy/positive

Amber = warning

Red = cap reached/problem

Blue/purple = primary action

Do not overuse color.

Use premium modern typography such as:

- Inter
- Geist
- equivalent high-quality UI font

---

# ANIMATION

Use animation deliberately.

Include:

- smooth page transitions
- number count-ups
- progress animations
- card hover effects
- subtle 3D card tilt
- glass reflections
- animated gradients
- progress rings
- modal transitions
- skeleton loaders
- staggered dashboard loading
- recommendation reveal animations

Support:

`prefers-reduced-motion`

When reduced motion is enabled, substantially reduce animation.

---

# APPLICATION NAVIGATION

Desktop sidebar:

- Dashboard
- Wallet
- Analyze
- Transactions
- Rewards
- Benefits
- Settings

Mobile:

- Home
- Wallet
- Analyze
- Transactions
- More

Primary CTA:

> Analyze Purchase

---

# COMMAND PALETTE

Implement:

**Cmd/Ctrl + K**

Commands:

- Analyze Purchase
- Add Card
- View Wallet
- View Transactions
- View Rewards
- View Benefits
- Settings

---

# DATA PRIVACY

Never request or store:

- complete card numbers
- CVV
- PIN
- OTP
- banking credentials

Cards are identified only by:

- country
- issuer
- card name
- variant
- network
- user nickname

V1 data remains on the user's device.

---

# PROJECT STATUS SYSTEM

Maintain a project status file/object.

Preferred file:

`PROJECT_STATUS.md`

Conceptually:

```text
Phase 1: NOT STARTED
Phase 2: NOT STARTED
Phase 3: NOT STARTED
Phase 4: NOT STARTED
Phase 5: NOT STARTED
Phase 6: NOT STARTED
Phase 7: NOT STARTED
Phase 8: NOT STARTED
```

Possible statuses:

- NOT STARTED
- IN PROGRESS
- COMPLETE

When a phase is completed, mark it COMPLETE.

Never mark a phase COMPLETE unless its completion criteria have been tested.

---

# PHASE 1
# FOUNDATION + PREMIUM UI

## Objective

Build the application shell, design system, navigation and premium futuristic dashboard.

Do NOT build the real reward engine yet.

Do NOT build real URL analysis yet.

---

## Build

Create:

- application shell
- responsive layout
- sidebar
- mobile navigation
- command palette
- dashboard
- wallet placeholder
- analyzer placeholder
- transactions placeholder
- rewards page
- benefits page
- settings page
- reusable UI components
- animation system

---

## Dashboard

Header:

> Good evening

Subheading:

> Your credit card command center.

Hero area:

### YOUR WALLET

Show beautiful demo cards:

- HDFC Infinia
- SBI Cashback
- Axis Atlas

These are demo UI objects.

Do not imply that demo reward data is verified.

---

### WHAT SHOULD I USE?

Large URL field:

> Paste a product or merchant URL...

Button:

> ANALYZE PURCHASE

For now this may navigate to the analyzer placeholder.

---

## Dashboard widgets

Create:

### Estimated Rewards

₹4,820

### Reward Capacity

78%

### Potential Value

₹1,240

### Cards Active

3

Use demo data.

---

### Reward Health

Show:

SBI Cashback

₹3,850 / ₹5,000

77%

HDFC Infinia

Healthy

Axis Atlas

62% milestone progress

---

### Spending Intelligence

Interactive chart:

- Shopping
- Food
- Travel
- Fuel
- Utilities
- Entertainment
- Other

---

### Upcoming Benefits

Examples:

- milestone reward
- travel benefit
- partner offer

---

### Recent Activity

Demo transactions.

---

## Phase 1 completion criteria

The application must:

- look polished
- navigate correctly
- be responsive
- have working animations
- have working command palette
- have reusable components
- have no major console errors
- support reduced motion
- contain no fake nonfunctional buttons except clearly marked placeholders

When complete:

> PHASE 1 = COMPLETE

STOP.

---

# PHASE 2
# CARD WALLET + CARD DATABASE

## Objective

Turn the wallet into a functional card-management system.

---

## Card database

Create versioned JSON data.

Initial market:

India.

Initial issuers should include representative cards from:

- HDFC
- SBI Card
- ICICI
- Axis
- Amex
- IDFC FIRST
- HSBC
- Kotak
- IndusInd
- RBL
- AU

Do NOT invent financial rules.

If exact data cannot be confidently verified:

> Mark the information as requiring verification.

---

## Card schema

Create an extensible structure containing:

- country
- issuer
- card name
- variant
- network
- annual fee
- currency
- reward currency
- reward rules
- caps
- categories
- exclusions
- benefits
- milestones
- offers
- verification metadata

Verification metadata:

- status
- last verified
- source

---

## Wallet

Users can:

- search cards
- filter by issuer
- select country
- select card
- add card
- remove card
- edit card
- nickname cards

---

## Intelligent matching

Support fuzzy card matching.

Example:

User types:

> HDFC infinia

Possible result:

> HDFC Infinia Metal Edition

Do not silently select uncertain matches.

---

## Custom cards

If card isn't found:

Allow manual creation.

Fields:

- issuer
- card name
- country
- network
- annual fee
- reward type
- reward rate
- reward currency
- caps
- eligible categories
- exclusions
- merchant rules
- redemption values
- milestones
- benefits

---

## Persistence

Save wallet data locally using IndexedDB/localStorage.

Refreshing the browser must preserve cards.

---

## Phase 2 completion criteria

Test:

- add card
- search card
- fuzzy matching
- custom card
- edit card
- remove card
- refresh persistence

When complete:

> PHASE 2 = COMPLETE

STOP.

---

# PHASE 3
# REWARD ENGINE + CAP ENGINE

## Objective

Build the deterministic financial calculation engine.

IMPORTANT:

Do NOT use an LLM for arithmetic.

All calculations must be deterministic TypeScript/JavaScript.

---

## Reward engine

Create modular functions for:

- base reward
- category reward
- merchant multiplier
- cashback
- points
- miles
- eligibility
- exclusions
- caps
- valuation
- effective value

---

## Cap engine

Support:

- monthly caps
- quarterly caps
- annual caps
- transaction caps
- category caps
- merchant caps

Example:

Cap:

₹5,000

Used:

₹3,850

Remaining:

₹1,150

If purchase would generate ₹1,500:

Actual eligible reward:

₹1,150

---

## Point valuation

Allow multiple redemption values.

Example:

2,000 points:

Travel = ₹2,000

Hotels = ₹1,800

Voucher = ₹1,200

Cashback = ₹500

---

## User preference

Support:

- Travel
- Cashback
- Hotels
- Shopping
- Maximum Value

Allow weighted preferences.

---

## Recommendation engine

Inputs:

- purchase
- merchant
- category
- cards
- reward rules
- current cap utilization
- offers
- milestones
- point valuation
- user preference

Output:

Ranked cards.

Each recommendation must contain:

- estimated reward
- effective value
- cap impact
- offer value
- explanation
- ranking

---

## Phase 3 completion criteria

Test calculations using known examples.

Test:

- basic cashback
- points
- caps
- category multipliers
- exclusions
- valuation
- multiple cards
- ranking

When complete:

> PHASE 3 = COMPLETE

STOP.

---

# PHASE 4
# PURCHASE ANALYZER

## Objective

Build:

> Paste URL → Analyze → Recommend card

---

## URL handling

Support major merchants where practical.

Initial examples:

- Amazon
- Flipkart
- Myntra
- Croma
- Reliance Digital
- Swiggy
- Zomato
- Uber
- MakeMyTrip

Do not claim arbitrary websites can always be scraped.

---

## Detect

Attempt to determine:

- merchant
- product
- price
- category
- country

---

## Analysis animation

Show:

✓ Merchant identified

✓ Product category identified

✓ Checking card eligibility

✓ Checking reward caps

✓ Checking offers

✓ Calculating reward value

✓ Applying your preferences

---

## Fallback

If automatic extraction fails:

Show:

> We couldn't retrieve all product details.

Allow manual entry:

- merchant
- product
- price
- category
- offer

Then continue analysis.

---

## Result

Show:

# 🏆 USE [CARD]

Example:

HDFC Infinia

Purchase:

Sony WH-1000XM6

₹39,990

Effective value:

₹1,333

Show breakdown:

Reward value

Offer value

Milestone contribution

Total

---

## Comparison

Show all eligible cards ranked.

Include:

- reward value
- offer value
- effective return
- cap impact
- reason

---

## Explain recommendation

Always explain why the winner was selected.

---

## Phase 4 completion criteria

Test:

- known merchant URL
- unsupported URL
- manual fallback
- multiple cards
- caps
- reward calculation
- recommendation

When complete:

> PHASE 4 = COMPLETE

STOP.

---

# PHASE 5
# TRANSACTIONS + SPENDING TRACKING

## Objective

Allow users to record actual purchases.

---

## Mark as Used

After recommendation:

> MARK AS USED

Automatically create transaction.

---

## Transaction fields

- date
- merchant
- product
- amount
- card
- category
- offer
- reward
- effective value

---

## Edit transaction

Allow editing all relevant fields.

Changes must recalculate:

- spending
- caps
- reward totals
- milestones

---

## Transactions page

Show:

- total spending
- rewards
- spending by card
- spending by category
- recent transactions

---

## Persistence

Transactions remain after refresh.

---

## Phase 5 completion criteria

Test:

- create transaction
- edit
- delete
- persistence
- cap updates
- dashboard updates
- spending charts

When complete:

> PHASE 5 = COMPLETE

STOP.

---

# PHASE 6
# OFFERS + MILESTONES + BENEFITS + ALERTS

## Objective

Expand the optimization engine.

---

# OFFERS

Support:

- bank offers
- merchant offers
- instant discounts
- reward multipliers

Allow manual offer entry.

Offer fields:

- issuer
- card
- merchant
- category
- minimum spend
- discount
- maximum discount
- validity
- eligibility

---

# MILESTONES

Support:

- monthly
- quarterly
- annual
- spend milestones

Show:

₹75,000 / ₹1,00,000

75%

₹25,000 remaining

Milestone value may influence recommendations.

---

# BENEFITS

Support:

- benefit name
- description
- value
- eligibility
- expiry
- status

---

# ALERTS

Create useful alerts:

- cap approaching
- cap reached
- milestone approaching
- better card available
- benefit expiring

Do not make alerts intrusive.

---

## Phase 6 completion criteria

Test:

- offers
- discounts
- milestones
- benefits
- alert generation
- recommendation impact

When complete:

> PHASE 6 = COMPLETE

STOP.

---

# PHASE 7
# ADVANCED DASHBOARD + ANALYTICS + POLISH

## Objective

Turn the application into a highly polished product.

---

## Dashboard

Replace unnecessary demo data with real user data.

Dashboard should dynamically show:

- rewards
- caps
- spending
- cards
- benefits
- milestones
- opportunities

---

## Analytics

Add:

### Spending trends

Daily/monthly.

### Rewards trends

Month-over-month.

### Card performance

Which card generates the most value.

### Category optimization

Where the user is getting the most/least value.

### Missed opportunity estimate

Example:

> You could have earned approximately ₹1,240 more this month.

Make clear that this is an estimate.

---

## Wallet efficiency

Calculate an overall wallet efficiency score based on actual available data.

Explain the score.

Do not create arbitrary scores without a documented calculation.

---

## Advanced visual polish

Improve:

- animations
- transitions
- card interactions
- charts
- tooltips
- loading states
- empty states
- error states
- responsive behavior

---

## Mobile

Ensure excellent mobile UX.

Analyzer must be particularly easy to use.

---

## Phase 7 completion criteria

Test desktop/tablet/mobile.

Test accessibility.

Test reduced motion.

Test performance.

When complete:

> PHASE 7 = COMPLETE

STOP.

---

# PHASE 8
# FINAL QA + DATA TOOLS + DEPLOYMENT

## Objective

Prepare CARD//OS for real-world use as a free web application.

---

# IMPORT / EXPORT

Add:

> Export My Data

JSON export.

Add:

> Import My Data

Allow restoration.

---

# RESET

Add:

> Delete all local data

with confirmation.

---

# SECURITY REVIEW

Confirm:

- no sensitive card data
- no banking credentials
- no secrets in frontend
- no unsafe URL execution
- sanitized user content

---

# PERFORMANCE

Optimize:

- bundle size
- rendering
- animations
- charts
- local database operations

---

# ACCESSIBILITY

Check:

- keyboard navigation
- focus states
- contrast
- semantic controls
- screen-reader labels
- reduced motion

---

# ERROR HANDLING

No raw technical errors.

All user-facing errors must be understandable.

---

# RESPONSIVE QA

Test:

- desktop
- tablet
- mobile

---

# FREE DEPLOYMENT

Ensure:

```bash
npm run build
```

works successfully.

The resulting application must be deployable to free static hosting such as:

- Cloudflare Pages
- Vercel

Do not require paid infrastructure.

---

# FINAL QA

Test the complete flow:

1. Open application.
2. Add card.
3. Refresh browser.
4. Card remains.
5. Select reward strategy.
6. Paste purchase URL.
7. Analyze.
8. Receive recommendation.
9. Compare cards.
10. Mark purchase as used.
11. Transaction appears.
12. Caps update.
13. Dashboard updates.
14. Spending updates.
15. Milestones update.
16. Offers are reflected.
17. Export data.
18. Delete data.
19. Import data.
20. Verify everything returns correctly.

Fix all major errors.

When complete:

> PHASE 8 = COMPLETE

---

# FUTURE FEATURES

Do NOT implement these during V1 unless specifically requested later.

Architecture should allow:

## V2

- accounts
- cloud sync
- automatic transaction imports
- bank integrations
- browser extension
- remote card database
- automatic card-rule verification
- AI product analysis
- automatic offer detection
- global countries
- EMI optimization
- annual-fee optimization
- card retention analysis
- personalized financial insights

Do not create fake working implementations for future functionality.

---

# DEVELOPMENT RULES

Always:

1. Inspect before modifying.
2. Preserve existing functionality.
3. Reuse components.
4. Keep business logic separate from UI.
5. Keep financial calculations deterministic.
6. Keep data structures extensible.
7. Avoid unnecessary dependencies.
8. Never invent financial information.
9. Clearly label estimated information.
10. Clearly distinguish verified vs user-provided data.
11. Never store sensitive card credentials.
12. Test each phase before completion.

---

# INFORMATION LABELS

Use three states:

### ✓ VERIFIED

Confirmed from a trusted source.

### ✎ USER PROVIDED

Entered by the user.

### ≈ ESTIMATED

Calculated/inferred value.

Do not present estimates as facts.

---

# CODE ARCHITECTURE

Prefer:

```text
src/

components/

pages/

features/

  dashboard/

  wallet/

  analyzer/

  transactions/

  rewards/

  benefits/

  settings/

core/

  rewardEngine/

  recommendationEngine/

  capEngine/

  offerEngine/

  valuationEngine/

data/

  cards/

  merchants/

  offers/

hooks/

store/

types/

utils/
```

Keep UI separate from financial logic.

---

# FINAL PRODUCT PRINCIPLE

CARD//OS must answer one question exceptionally well:

> **"Given what I own, what I'm buying, and what matters to me, which card should I use?"**

The user should trust the recommendation because CARD//OS clearly explains:

- what it calculated
- what rules applied
- what caps remain
- what offers were considered
- how reward points were valued
- why the winning card was selected

Never hide the reasoning.

---

# MASTER CONTROLLER FINAL RULE

When the user says:

> CONTINUE

identify the next incomplete phase and execute ONLY that phase.

Do not ask which phase to execute.

Do not repeat completed phases.

Do not rebuild previous phases.

Do not automatically execute multiple phases.

After completing the phase:

1. Test.
2. Fix.
3. Update project status.
4. Summarize what changed.
5. STOP.

The user will say:

> CONTINUE

when ready for the next phase.
