[B][SIZE=6]TerraGuide — an interactive Terraria 1.4.5.8 build guide & loadout planner[/SIZE][/B]

Hi everyone! I'm [B]Dkaisak[/B].

I've been playing Terraria since I was about 15 — I'm 29 now. I started back when [B]Molten was the strongest armor set in the game[/B], and I never really stopped. These days I work as a [B]freelance developer[/B], and I still love this game, so I poured that love (and my job) into a little project I'd like to share with you: [B]TerraGuide[/B].

It's an interactive guide that tells you [B]what to use at every stage of the game[/B] for every class — and it also lets you build and compare your own loadouts.

[QUOTE][B]Status: early testing phase.[/B] TerraGuide is a work in progress. The data and features are usable, but there will be rough edges, missing items and the occasional mistake. That's exactly why I'm posting it now: I want the community to [B]use it, break it and tell me what to fix[/B], so we can keep updating and improving it together.[/QUOTE]

[B]Repository:[/B] [URL='https://github.com/Dkaisak/TerraGuide']https://github.com/Dkaisak/TerraGuide[/URL]

[HR][/HR]

[B][SIZE=5]What it is[/SIZE][/B]

Pick a [B]class[/B] (Melee / Ranged / Magic / Summoner) and a [B]stage[/B] (9 milestones, from Pre-Bosses to Post-Moon Lord), and TerraGuide shows the recommended loadout — armor, weapon(s), accessories, buffs and ammo — [B]with the reasoning behind every single item[/B].

It's not just a list of gear: every entry explains [I]why[/I] it's there, [I]how[/I] to get it, and [I]what it costs you[/I] in terms of farming.

[B][SIZE=5]Highlights[/SIZE][/B]

[LIST]
[*][B]36 curated builds[/B] (4 classes × 9 stages) with [B]subclass variants[/B]: sword/yoyo, bow/gun/launcher/thrown, minion/whip/sentry.
[*][B]Every item explains itself[/B]: stats, drop sources with rates per difficulty, NPC shops and prices, a full [B]crafting tree[/B] and an aggregated [B]material list[/B].
[*][B]Difficulty-aware[/B]: accessory slots change with Classic / Expert / Master (5/6/7) and Expert-only items are filtered out in Classic.
[*][B]"How to start this stage"[/B] mini-guide plus [B]arena & strategy tips[/B] for every stage.
[*][B]Farming route[/B]: all the items you need, grouped by [B]zone/biome[/B], so you know where to go.
[*][B]Item database[/B] with filters by class, type, role and rarity.
[*][B]Mechanics notes[/B] — e.g. the new [B]1.4.5.7 whip stacking and tag slots[/B] — each linked to the wiki.
[*][B]Build Tester[/B]: dress a paper doll, watch [B]live stats[/B] (defense, damage, crit, estimated DPS), apply [B]recommended reforges[/B], [B]save/share[/B] builds by URL, and [B]compare two builds A/B[/B] — including a fully custom "Build B".
[*][B]Global search[/B] (Ctrl/⌘+K) that opens the item card right inside the app.
[*][B]Bilingual[/B]: the whole interface and content are available in [B]Spanish and English[/B].
[/LIST]

[B][SIZE=5]Screenshots[/SIZE][/B]

[I]Pick a class and a stage, and get the full loadout with the reasoning behind every item.[/I]

[IMG]https://raw.githubusercontent.com/Dkaisak/TerraGuide/main/docs/screenshots/01-home.png[/IMG]

[I]Every item card opens a full breakdown: how to get it, stats, drop sources and its crafting tree.[/I]

[IMG]https://raw.githubusercontent.com/Dkaisak/TerraGuide/main/docs/screenshots/06-item-card.png[/IMG]

[I]Browse the item database with filters by class, type, role and rarity.[/I]

[IMG]https://raw.githubusercontent.com/Dkaisak/TerraGuide/main/docs/screenshots/04-items.png[/IMG]

[I]Whip stacking loadout for the Summoner.[/I]

[IMG]https://raw.githubusercontent.com/Dkaisak/TerraGuide/main/docs/screenshots/03-whip.png[/IMG]

[I]Build Tester with live stats, reforges and A/B comparison.[/I]

[IMG]https://raw.githubusercontent.com/Dkaisak/TerraGuide/main/docs/screenshots/05-builder.png[/IMG]

[B][SIZE=5]The data[/SIZE][/B]

Everything is hand-curated JSON and validated by a script:

[LIST]
[*][B]873 items[/B], [B]32 armor sets[/B], [B]672 recipes[/B], [B]1,199 drop sources[/B], [B]36 builds[/B].
[*]Aligned to [B]Terraria 1.4.5.8[/B] and cross-checked against the Official Terraria Wiki. Nothing is invented — if it's in the guide, it's in the dataset.
[/LIST]

[B][SIZE=5]Tech[/SIZE][/B]

Next.js 16 (App Router, static generation), TypeScript, Tailwind v4, zod for data validation and MiniSearch for search. There's [B]no backend[/B] — it's a static site, so it can be hosted anywhere.

[B][SIZE=5]Try it locally[/SIZE][/B]

[CODE]git clone https://github.com/Dkaisak/TerraGuide.git
cd TerraGuide
npm install
npm run dev   # http://localhost:3001[/CODE]

[B][SIZE=5]Feedback is the whole point[/SIZE][/B]

This project only gets better with your input. It started as a personal tool to stop alt-tabbing between the wiki and my inventory, but the goal now is to turn it into something the whole community can rely on — and for that I need [B]constant feedback[/B].

So please, tell me anything:

[LIST]
[*]Wrong drop rate, wrong source or missing item?
[*]A build choice you disagree with (or a better alternative for a stage)?
[*]A missing mechanic, a bug, a confusing screen, a translation that reads wrong?
[*]A feature you'd like to see?
[/LIST]

Open an [B]issue[/B] on GitHub, reply here, or send me a DM. I'll keep iterating and pushing updates based on what you report — accuracy and usefulness matter more to me than shipping fast, and I'd rather fix something than leave it misleading.

If you want to help build it, [B]PRs are welcome[/B]: the dataset lives in plain JSON and a validator script keeps everything consistent, so it's easy to contribute data or fixes.

[B][SIZE=5]What's next[/SIZE][/B]

[LIST]
[*]A hosted public version.
[*]Per-item English text for the few descriptions that are still generated.
[*]More mechanics notes as 1.4.5.x evolves.
[*]Regular data updates and fixes driven by community feedback.
[*]And whatever else you ask for!
[/LIST]

[B][SIZE=5]Disclaimer[/SIZE][/B]

This is an unofficial fan project and is [B]not affiliated with Re-Logic[/B]. Item names and sprites belong to Re-Logic; sprites are sourced from the Official Terraria Wiki.
