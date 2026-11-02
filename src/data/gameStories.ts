export interface GameStory {
  moduleId: number;
  title: string;
  hook: string;
  setup: string;
  choices: string;
  stakesDetail: string;
  yourRole: string;
  counterpartRole: string;
  stakes: string;
}

export const GAME_STORIES: Record<number, GameStory> = {
  1: {
    moduleId: 1,
    title: "The Soundproof Interrogation",
    hook: "You and your partner are apprehended following a diamond heist. Separated into soundproof rooms, the detective offers a deal: stay silent and you both serve 1 year (+2 pts each). Snitch while your partner stays silent, and you walk free with immunity (+3 pts) while they take 10 years (0 pts). But if both snitch, you both get 5 years (+1 pt).",
    setup: "You and your accomplice are interrogated in separate soundproof rooms with zero communication.",
    choices: "Choose whether to Cooperate (stay silent) or Defect (confess and turn state's evidence).",
    stakesDetail: "Mutual silence gives 1 year (+2 pts each); betraying gives total immunity (+3 pts) if they stay silent, but both confessing gives 5 years (+1 pt).",
    yourRole: "Suspect in Interrogation Room A",
    counterpartRole: "Suspect in Interrogation Room B",
    stakes: "Immunity vs. Prison Sentence"
  },
  6: {
    moduleId: 6,
    title: "The Long-Term Supply Contract",
    hook: "You and a rival parts supplier run repeated monthly shipments for an automotive plant. Delivering premium components (Cooperate) yields sustained shared profits (+$2.00/mo). Cutting corners (Defect) nets a quick windfall (+$3.00), but your partner remembers and can retaliate in future months.",
    setup: "You and a partner supplier ship parts to an auto manufacturer across 5 monthly production cycles.",
    choices: "Deliver premium components (Cooperate) or cut corners for quick cash (Defect) each cycle.",
    stakesDetail: "Sustained cooperation earns +$2.00/round ($10 total); defecting nets $3.00 once but invites immediate retaliatory punishment.",
    yourRole: "Lead Parts Manufacturer",
    counterpartRole: "Partner Logistics Supplier",
    stakes: "Long-Term Commercial Trust vs. Quick Profit"
  },
  3: {
    moduleId: 3,
    title: "The Highway Gas War",
    hook: "You own one of two service stations positioned directly across from each other on an isolated desert highway. Motorists buy exclusively from whichever station posts the cheaper gallon. If both charge high, you split high profits (+2 pts each); undercutting steals the entire highway (+3 pts), but a price war drops profits to cost (+1 pt).",
    setup: "Two filling stations sit directly across from each other on an isolated desert highway.",
    choices: "Post a High Price ($4.00/gal) or undercut with a Low Price ($3.00/gal) for passing drivers.",
    stakesDetail: "Both charging high splits +2 pts each; undercutting captures 100% (+3 pts); a price war collapses profits to +1 pt.",
    yourRole: "Independent Station Owner",
    counterpartRole: "Cross-Street Competitor",
    stakes: "Market Share vs. Price Collusion"
  },
  2: {
    moduleId: 2,
    title: "The AI Startup vs. Tech Giant",
    hook: "You founded a boutique AI workflow startup deciding whether to Launch into a lucrative enterprise sector or Wait. An incumbent tech giant monitors your decision: if they accommodate your launch, you thrive (+4 pts); if they ignite a predatory price war to squash you, both suffer heavy losses.",
    setup: "Your enterprise AI startup faces an established tech titan dominating the corporate market.",
    choices: "Launch into the sector immediately, or Wait to refine product capabilities.",
    stakesDetail: "If you launch and they accommodate, you capture +4 pts; if they trigger a predatory price war, both suffer heavy losses.",
    yourRole: "Disruptive Startup Founder",
    counterpartRole: "Incumbent Tech Titan",
    stakes: "Enterprise Market Entry vs. Price War"
  },
  4: {
    moduleId: 4,
    title: "The Flash Sale Ad Clash",
    hook: "You and your main retail competitor are picking which day (Mon, Wed, Fri) to drop a massive flash sale campaign. If you both pick the same day, ad noise divides customers and profits drop to zero. Picking different days lets each capture clear shoppers (+1 pt each).",
    setup: "Two rival online retail brands are scheduling exclusive 24-hour promotional sale campaigns.",
    choices: "Select which weekday (Monday, Wednesday, or Friday) to launch your promotional blitz.",
    stakesDetail: "Picking separate days captures clear consumer attention (+1 pt each); clashing on the same day divides ad noise and ruins sales (0 pts).",
    yourRole: "Retail Marketing Director",
    counterpartRole: "Rival Chain Marketer",
    stakes: "Audience Attention vs. Ad Cannibalization"
  },
  5: {
    moduleId: 5,
    title: "Building the Capacity Fortress",
    hook: "As the market leader in battery cells, a rival threatens to enter your territory. You can sink millions building an irreversible mega-factory (Commit) to make price wars lethal, or Stay Flexible. Your credible commitment can scare the rival into staying out (+4 pts).",
    setup: "As the dominant EV battery producer, a foreign competitor evaluates building a domestic plant.",
    choices: "Sink irreversible capital into a mega-factory (Commit) or retain capital reserves (Stay Flexible).",
    stakesDetail: "A credible fortress scares the rival into staying out (+4 pts); hesitating invites entry and erodes long-term monopoly profits.",
    yourRole: "Incumbent Manufacturer",
    counterpartRole: "Challenger Firm",
    stakes: "Monopoly Profits vs. Costly Deterrence"
  },
  7: {
    moduleId: 7,
    title: "The Masterpiece Art Auction",
    hook: "A rare Renaissance painting is up for auction under Vickrey rules: the highest bidder wins the artwork, but only pays the second-highest bid. Bidding your honest private valuation guarantees you never overpay and maximizes your odds of a bargain.",
    setup: "A rare Renaissance masterpiece is auctioned via sealed second-price (Vickrey) auction rules.",
    choices: "Submit a private sealed bid ($0 to $12) based on your private valuation.",
    stakesDetail: "Highest bidder wins and pays the second-highest bid. Bidding your exact valuation guarantees you never overpay or suffer buyer's remorse.",
    yourRole: "Private Art Collector",
    counterpartRole: "Rival Consortium Bidder",
    stakes: "Acquiring Masterpiece at Fair Market Price"
  },
  8: {
    moduleId: 8,
    title: "The Defense Procurement Contract",
    hook: "The Ministry of Defense is awarding a drone logistics contract in a first-price sealed-bid auction. The lowest bidder wins and is paid exactly what they bid. Bidding too high loses the deal; bidding too low leaves zero margin.",
    setup: "The Defense Department awards a high-value drone logistics fleet in a first-price sealed auction.",
    choices: "Submit your sealed price bid (pay-as-bid auction).",
    stakesDetail: "Highest bidder wins and pays their own bid. Shading your bid below value protects profit margin, but bidding too low forfeits the deal.",
    yourRole: "Aviation Defense Contractor",
    counterpartRole: "Competing Aerospace Firm",
    stakes: "Securing Defense Contract with Profitable Margin"
  },
  9: {
    moduleId: 9,
    title: "The Midnight Strike Negotiation",
    hook: "The factory union and management must divide a $10M operational surplus before midnight. Both sides simultaneously demand their share. If demands sum to 10 points or less, both get what they asked. If greed causes demands to exceed 10, talks collapse to meager outside options (+1 pt each).",
    setup: "A manufacturing union and executive management must divide a $10M operational surplus before midnight.",
    choices: "Simultaneously declare how many millions (0 to 10) your organization demands.",
    stakesDetail: "If total demands sum to ≤ 10, both receive their claim; if greed pushes the sum over 10, negotiations collapse to strike options (+1 pt each).",
    yourRole: "Union Chief Negotiator",
    counterpartRole: "Corporate Managing Director",
    stakes: "$10M Profit Split vs. Crippling Strike"
  },
  10: {
    moduleId: 10,
    title: "The Diamond vs. Lemon Dealership",
    hook: "You run a specialized dealership selling high-grade vehicles, but buyers fear purchasing a defective 'lemon'. You can send a costly certified warranty signal to prove authenticity. High-quality cars pass easily; for lemons, falsifying certification costs more than it's worth.",
    setup: "You sell pre-owned luxury sports cars, but cautious buyers cannot inspect internal engine quality.",
    choices: "Offer an expensive certified warranty audit (Costly Signal) or sell without warranty.",
    stakesDetail: "High-quality vehicles pass certification at low cost; lemons cannot fake signals profitably, allowing honest dealers to separate from lemons.",
    yourRole: "Independent Auto Dealer",
    counterpartRole: "Cautious Commercial Buyer",
    stakes: "Premium Reputation vs. Lemons Market Collapse"
  },
  11: {
    moduleId: 11,
    title: "The Wall Street Momentum Trade",
    hook: "In John Maynard Keynes's famous stock market analogy, investors pick the prettiest face not by their own taste, but by predicting what the average participant will pick. You must guess 2/3 of the average guess. Outsmarting your rival requires thinking one step deeper than them.",
    setup: "Traders must guess 2/3 of the average number submitted by all participants (0 to 100).",
    choices: "Pick an integer guess based on how many steps of strategic reasoning other traders will take.",
    stakesDetail: "Closest guess takes the +10 pt prize. Random players guess 50, Level-1 players guess 33, and rational equilibrium converges to 0.",
    yourRole: "Quantitative Hedge Fund Analyst",
    counterpartRole: "Competing Algo Trader",
    stakes: "Winning Prize Pot vs. Level-k Miscalculation"
  },
  12: {
    moduleId: 12,
    title: "Tragedy of the Commons & Coastal Fishery",
    hook: "You and neighboring fleets fish a common offshore coastal bank. Restraining your catch lets juvenile fish mature and regenerate (1.6x yield), sustaining prosperity for all boats. But unrestrained overfishing by individual trawlers depletes the breeding stock, leaving the entire community with a barren ocean.",
    setup: "Independent fishing trawlers share an offshore renewable fishery with a 1.6x seasonal biological reproduction rate.",
    choices: "Set conservation quota (0 to 20 boats/tokens contributed to the common marine reserve vs. private harvest).",
    stakesDetail: "Conserved marine stock reproduces by 1.6x and distributes equally (+0.80 pts/fish); overharvesting privatizes short-term catch but triggers ecological tragedy.",
    yourRole: "Harbor Trawler Captain",
    counterpartRole: "Competing Fleet Operators",
    stakes: "Sustainable Marine Yield vs. Fishery Depletion Collapse"
  },
  13: {
    moduleId: 13,
    title: "The Frozen Ridge Hunt",
    hook: "You and a fellow hunter venture into a harsh winter wilderness. Tracking a giant Stag requires both hunters working together (+10 pts each). But either hunter can peel off to shoot an easy lone Hare (+4 pts), abandoning their partner in the snow with nothing (0 pts).",
    setup: "Two survivalist hunters track game along an icy mountain ridge in subzero conditions.",
    choices: "Cooperate to hunt the high-reward Stag (🦌) or defect to chase a solitary Hare (🐇) alone.",
    stakesDetail: "Taking down the Stag requires both hunters (+10 pts each); hunting Hare guarantees +4 pts safely, but leaves a Stag hunter with 0 pts.",
    yourRole: "Highland Expedition Hunter",
    counterpartRole: "Partner Expedition Hunter",
    stakes: "Feast with High Risk vs. Safe Small Catch"
  },
  14: {
    moduleId: 14,
    title: "The E-Commerce Pricing War",
    hook: "You and an online competitor sell identical electronics online. Price shoppers buy 100% from whichever vendor posts the lowest price. Undercutting by just $1 captures the entire customer base, but race-to-the-bottom pricing wipes out profit margins down to wholesale cost.",
    setup: "Two certified online merchants sell identical brand-name smartphones with fixed $10 unit cost.",
    choices: "Set a retail product price between $10 and $50.",
    stakesDetail: "The lower price wins 100% of customer orders; the higher price sells 0. Undercutting by $1 sparks a price war down to $10 cost.",
    yourRole: "Online Marketplace Merchant",
    counterpartRole: "Rival Digital Vendor",
    stakes: "Total Sales Volume vs. Zero-Profit Trap"
  },
  15: {
    moduleId: 15,
    title: "The Single-Lane Railroad Bridge",
    hook: "Two rival freight trains are speeding toward a narrow one-track bridge from opposite ends. Swerving (Dove) avoids disaster but surrenders pride and cargo right-of-way; charging forward (Hawk) wins glory, but if neither yields, a catastrophic collision wipes out both (-5 pts).",
    setup: "Two high-speed freight trains approach an un-signaled one-track bridge from opposite directions.",
    choices: "Brake and yield right-of-way (Dove) or accelerate through the bridge (Hawk).",
    stakesDetail: "One braking lets the other claim route glory (+2 vs 0 pts); both refusing to yield causes a catastrophic head-on collision (-5 pts each).",
    yourRole: "Locomotive Captain",
    counterpartRole: "Approaching Train Engineer",
    stakes: "Territorial Dominance vs. Mutual Destruction"
  },
  16: {
    moduleId: 16,
    title: "The Seed Round Term Sheet",
    hook: "You hold a $10 equity prize pool to divide with an entrepreneur. You propose an offer (Take-It-Or-Leave-It). If the responder accepts, you keep the remainder and they receive your offer. If they find your split insulting, they can reject it, leaving both with $0.00.",
    setup: "An angel investor holds $10 in venture capital to divide with a founder in a take-it-or-leave-it deal.",
    choices: "Propose an allocation ($0 to $10) for the founder.",
    stakesDetail: "If accepted, capital splits as proposed; if the founder rejects an unfair offer out of pride, both walk away with $0.00.",
    yourRole: "Lead Angel Investor",
    counterpartRole: "Early-Stage Startup Founder",
    stakes: "Optimal Deal Capture vs. Spiteful Rejection"
  },
  17: {
    moduleId: 17,
    title: "The Championship Penalty Shootout",
    hook: "It is the 90th minute of the cup final. As the striker, you choose whether to kick Left or Right; the goalkeeper dives Left or Right. If your choices match, the keeper saves the shot; if they mismatch, you score the winning goal.",
    setup: "A decisive penalty kick in the 90th minute of the championship final: Striker vs Goalkeeper.",
    choices: "Pick Left or Right to shoot (Striker) or dive (Keeper).",
    stakesDetail: "Matching sides saves the ball (+1 pt Keeper, -1 pt Striker); mismatched sides scores the winning goal (+1 pt Striker, -1 pt Keeper).",
    yourRole: "Championship Penalty Striker",
    counterpartRole: "Starting Goalkeeper",
    stakes: "Winning Goal vs. Saved Shot (Zero-Sum)"
  },
  18: {
    moduleId: 18,
    title: "The Anniversary Night Out",
    hook: "You and your partner want nothing more than to spend the evening together, but you disagree on where to go: you prefer the Opera, while they prefer the Football Match. Going together to either venue beats spending the evening alone in frustration.",
    setup: "Two partners want to celebrate their anniversary together, but have conflicting entertainment tastes.",
    choices: "Head to the Opera (cultural preference) or the Football match (sports preference).",
    stakesDetail: "Attending the same venue yields happiness (+3 pts for favorite, +2 pts for partner); going to different venues leaves both miserable (0 pts).",
    yourRole: "Arts & Culture Enthusiast",
    counterpartRole: "Sports Fan Partner",
    stakes: "Coordination & Compromise vs. Solitary Evening"
  },
  19: {
    moduleId: 19,
    title: "The Startup Seed Investment",
    hook: "You have $10 in capital. You can send any portion to an entrepreneur (Trustee), which immediately triples in their hands (3x). You rely on the founder's goodwill to send back a fair profit dividend. High trust expands the pie, but betrayal leaves the investor empty-handed.",
    setup: "An investor can send $0 to $10 of seed capital to an entrepreneur to build a commercial prototype.",
    choices: "Choose investment amount; transferred funds triple (3x) in the founder's workshop.",
    stakesDetail: "Trust triples the capital, creating mutual abundance; but the founder chooses how much to return, risking total investor loss.",
    yourRole: "Venture Capital Investor",
    counterpartRole: "Startup Managing Trustee",
    stakes: "Wealth Multiplication vs. Embezzlement"
  },
  20: {
    moduleId: 20,
    title: "The Escalating Mountain of Gold",
    hook: "You and a counterpart walk along an alternating 6-step treasure path. On your turn, choosing to Pass doubles the gold in the shared chest and passes the decision. But choosing to Take ends the game immediately, letting you seize the lion's share before the other person can.",
    setup: "Two explorers walk along a 6-stage treasure corridor with a steadily multiplying gold chest.",
    choices: "Choose Pass to double the chest for the next node, or Take to seize the current majority.",
    stakesDetail: "Passing through all 6 nodes reaches maximum wealth (+8 pts each); taking on Node 1 locks in (+2, 0) pts out of fear.",
    yourRole: "Treasure Explorer (Turns 1, 3, 5)",
    counterpartRole: "Expedition Partner (Turns 2, 4, 6)",
    stakes: "Social Optimum (+8 pts) vs. Early Betrayal (+2 pts)"
  },
  21: {
    moduleId: 21,
    title: "The Industrial Output Clash",
    hook: "You and a competing chemical conglomerate produce identical industrial solvent. Instead of cutting prices directly, both firms simultaneously set production quotas. The total market quantity determines the market-clearing price: producing too much floods the market and depresses margins, while producing too little forfeits lucrative volume.",
    setup: "Two chemical producers set output quantities (q1, q2) with clearing price P = 100 - (q1 + q2) and $10 unit cost.",
    choices: "Select your production quantity between 10 and 45 units.",
    stakesDetail: "Nash equilibrium is 30 units each ($900 profit); collusive monopoly quota is 22.5 units ($1,012 profit); overproduction floods the market.",
    yourRole: "Managing Director of Operations",
    counterpartRole: "Rival Chemical Conglomerate",
    stakes: "Profitable Oligopoly Output vs. Market Flooding"
  },
  22: {
    moduleId: 22,
    title: "The Boardwalk Ice Cream Duel",
    hook: "You and a rival ice cream vendor operate mobile carts along a 100-yard sunny beach. Sunbathers are spread evenly from 0 to 100 yards and walk to whichever cart is closer. While spreading out at 25 and 75 minimizes walking distance for bathers, strategic positioning draws both carts inward until they collide at the exact center.",
    setup: "Two ice cream vendors choose a location between 0 and 100 along a beach boardwalk with evenly distributed customers.",
    choices: "Position your mobile cart anywhere between Mile 0 and Mile 100.",
    stakesDetail: "Each vendor captures all bathers on their side of the midpoint; the unique Nash equilibrium forces both carts to the exact center (50/50 split).",
    yourRole: "Independent Beachside Vendor",
    counterpartRole: "Rival Ice Cream Cart Operator",
    stakes: "Capturing Promenade Foot Traffic vs. Direct Cannibalization"
  },
  23: {
    moduleId: 23,
    title: "The Three Mountain Passes",
    hook: "War has broken out across a rugged mountain frontier with three critical alpine passes: the Northern Pass, Central Valley, and Southern Defile. You command 100 elite battalions and must distribute them across the three fronts. Whichever commander sends more troops to a pass captures it; controlling two or more passes wins the campaign.",
    setup: "Two commanders must distribute 100 military battalions across three strategic mountain passes simultaneously.",
    choices: "Allocate your 100 battalions across Front A, Front B, and Front C (A + B + C = 100).",
    stakesDetail: "Controlling at least 2 of 3 passes wins the battle (+1 pt); losing 2 passes surrenders the frontier (-1 pt). There is no pure-strategy equilibrium!",
    yourRole: "Expeditionary Force Commander",
    counterpartRole: "Opposing Army General",
    stakes: "Frontier Conquest vs. Territorial Defeat"
  },
  24: {
    moduleId: 24,
    title: "The Offshore Oil Tract Auction",
    hook: "An offshore parcel with an unknown reservoir of crude oil is being auctioned in a sealed-bid sale. Both you and a rival oil major conduct independent seismic surveys. Because drilling measurements have random noise, winning the auction means your survey was more optimistic than your rival's—putting you at severe risk of the dreaded Winner's Curse.",
    setup: "An offshore oil tract has true common value V in [$20, $80]. You receive a noisy seismic survey estimate (V ± $10).",
    choices: "Submit a sealed dollar bid based on your private seismic estimate.",
    stakesDetail: "Highest bidder wins and pays their bid. Bidding your raw estimate causes severe losses (Winner's Curse); rational bidding shades down for adverse selection.",
    yourRole: "Chief Petroleum Geologist & Bidder",
    counterpartRole: "Global Energy Exploration Giant",
    stakes: "Extracting Commercial Oil Reserves vs. The Winner's Curse"
  }
};

export const getGameStory = (moduleId: number): GameStory => {
  return GAME_STORIES[moduleId] || {
    moduleId,
    title: "The Strategic Encounter",
    hook: "You and your opponent face a classic conflict of interest where your optimal decision depends on what your counterpart decides to do. Weigh the incentives carefully before committing your choice.",
    setup: "You and your counterpart face an interactive strategic dilemma with interdependent payoffs.",
    choices: "Evaluate your available decision moves and commit your choice simultaneously.",
    stakesDetail: "Your points depend directly on the combination of choices made by you and your counterpart.",
    yourRole: "Primary Decision Maker",
    counterpartRole: "Counterpart Strategist",
    stakes: "Higher Payoff vs. Strategic Exploitation"
  };
};
