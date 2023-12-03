/* eslint-disable jest/no-disabled-tests */
import { Mook } from "@module/mook/document"
import { MookParser } from "@module/mook/parse"
import { FakeGame, _defaultMookData } from "./common"
import { gid } from "@module/data"

// Add real tests here.
describe("Mook generator", () => {
	let _mook: Mook
	let _parser: MookParser


	beforeEach(() => {
		_mook = new Mook(_defaultMookData)
		_parser = new MookParser("", _mook)
			; (global as any).game = new FakeGame()
	})

	describe("Attribute Parsing", () => {
		it("Standard attributes are parsed", () => {
			_parser.text = _oldStats[0] // Goblin
			_parser.parseStatBlock(_parser.text)

			_mook.getAttributes()
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Strength)?.adj)
				.toBe(1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Dexterity)?.adj)
				.toBe(1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Intelligence)?.adj)
				.toBe(-1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Health)?.adj)
				.toBe(1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Will)?.adj)
				.toBe(1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.FrightCheck)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Perception)?.adj)
				.toBe(1)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Vision)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Hearing)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.TasteSmell)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.Touch)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.BasicSpeed)?.adj)
				.toBe(0.5)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.BasicMove)?.adj)
				.toBe(-2)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.FatiguePoints)?.adj)
				.toBe(0)
			expect(_mook.system.attributes.find(e => e.attr_id === gid.HitPoints)?.adj)
				.toBe(1)
		})

	})
})

// Old test stablocks here
const _oldStats = [
	// 0

	`Goblin
Goblins are the smallest of the goblin-kin, and therefore
spend their days being bullied by orcs and tossed around by
angry hobgoblins. This has led to a cowardly disposition,
yet they�fre survivors, and deadlier in a fight than the typical
human. In combat, they prefer stealthy ambushes involving
ranged (and preferably poisoned) weapons, followed by running
away.
Goblins stand 2�h shorter than humans on average, but
like all goblin-kin are densely built and thus no lighter. They
resemble nothing so much as misshapen, hunchbacked elves
with pointy ears and needle-like teeth. Skin tones vary greatly,
but tend toward the greenish.
ST: 11 HP: 12 Speed: 6.00
DX: 11 Will: 10 Move: 4
IQ: 9 Per: 10
HT: 11 FP: 11 SM: 0
Dodge: 8 Parry/Block: 9 DR: 2
Bite (13): 1d-1 cutting. Reach C.
Kick (11): 1d+1 crushing (includes +1 for heavy boots).
Reach C, 1.
Long Knife (13): 1d cutting or 1d-1 impaling. Reach C, 1.
Punch (13): 1d-1 crushing. Reach C.
Shield Bash (12): 1d-1 crushing. Reach 1.
Short Bow (13): 1d-1(2) piercing + follow-up 2 points toxic
(HT to resist). Ranged, with Acc 1, 1/2D 110, Max 165,
Shots 1(2), Bulk -6.
Traits: Appearance (Ugly); Cowardice (12); Infravision;
Rapid Healing; Resistant to Disease 5; Resistant to Poison
5; Social Stigma (Savage).
Skills: Bow-13; Brawling-13; Knife-13; Shield-12; Stealth-12.
Class: Mundane.
Notes: Equipped with heavy leather armor (DR included
above; thoroughly lice-ridden, stinking, and unsalable),
small shield (DB 1), long knife, short bow, and 10 bodkin
arrows poisoned with monster drool. This puts the goblin
at Light encumbrance, as reflected in the stats. A nonwarrior
would have ST 10 (and lower damage), DX 10, HP
11, Speed 5.25, and reduced combat skills. Leaders have
IQ 10+ and higher skills, and often trade bow and arrows
for a saber (1d cutting or impaling) to wave around while
giving orders. Shamans have IQ 10+ and Power Investiture
1-3 . and goblin gods grant their clerics nasty wizardly
spells such as Deathtouch! Goblins are easily intimidated,
so they�fll negotiate if cornered . . . and backstab as soon as
they aren�ft.`,
	// 1
	`ST: 13 HP: 13 Speed: 5.00
DX: 11 Will: 9 Move: 5
IQ: 9 Per: 12
HT: 11 FP: 11 SM: 0
Dodge: 8 Parry: 9 DR: 1
Kick (11): 1d+1 crushing. Reach C, 1.
Punch (13): 1d crushing. Reach C.
Stone-Headed Club (12): 2d+3 crushing. Reach 1.
Traits: Animal Empathy; Appearance (Unattractive); Arm ST
1; Brachiator (Move 3); Social Stigma (Savage); Temperature
Tolerance 2 (Cold).
Skills: Axe/Mace-12; Brawling-13; Camouflage-12; Climbing-
13; Stealth-12; Tracking-12; Wrestling-12.
Class: Mundane.
Notes: Effective ST 15 when grappling, thanks to Arm ST
and Wrestling. These stats represent a wildman; females
are'nt often warriors, and have ST 12 (and lower damage),
DX 10, HP 12, and reduced combat skills, but superior
Camouflage and Stealth, and a tendency to climb up high
and pelt foes with large stones (Throwing-12, 1d-2 crushing)
to support their males and guard beasts. A wildman
generally carries a stone-tipped club (treat as a mace)
and wears hides (DR 1, included above); more advanced
gear is extremely unlikely, and wildman conscripts given
such equipment never get used to it: .2 to combat skills.
Spellcasters are always shamans with IQ 10+, Power Investiture
1-3, and druidic spells. Wildmen will negotiate with
anyone who hasn't violated one of their taboos.
`,
	// 2
	`STEALTH GOLEM
ST 21; DX 16*; IQ 11; HT 14.
Will 13; Per 16*; Speed 9.00; Dodge 12*; Move 9*.
SM 0; 300 lbs.
Traits: Absolute Direction; Automaton; Cannot Float; Danger
Sense*; Doesn't Breathe; DR 4; Fragile (Unnatural);
Indomitable; Machine; Night Vision 9*; Nocturnal (Can
function weakly out of direct sunlight); Payload 1; Perfect
Balance*; Reduced Consumption (Based on Powerstone);
Reprogrammable; Single-Minded; Unaging; Unfazeable;
Vacuum Support.
Skills: Acrobatics-15; Brawling-18; Climbing-18; Cloak-15;
Escape-16; Filch-16; Forced Entry-17; Garrote-18; Holdout-
15; Knife-18; Lockpicking-16; Observation-16; Pickpocket-
16; Search-17; Shadowing-14; Shortsword-16; Staff-16;
Stealth-18; Tactics-12; Traps-14.
* During daylight hours, the stealth golem has DX 10, Per
10, Dodge 8, Move 5, and loses these specific advantages.
Modify all skills accordingly.`,
	// 3

	`ST: 11 HP: 11 Speed: 8.00
DX: 13 Will: 8 Move: 8
IQ: 8 Per: 8
HT: 12 FP: N/A SM: 0
Dodge: 11 Parry/Block: 10 DR: 2
Bony Claw (14): 1d-1 crushing. Reach C.
Longbow (14): 1d+1 impaling. Ranged, with Acc 3, 1/2D 165,
Max 220, Shots 1(2), Bulk -8.
Shield Bash (14): 1d-1 crushing. Reach 1.
Weapon (14): Axe (1d+3 cutting), shortsword (1d+1 cutting
or 1d impaling), small mace (1d+3 crushing), spear (1d+1
impaling), etc. Reach 1.
Traits: Appearance (Monstrous); Automaton; Brittle; Cannot
Float; Cannot Learn; Dependency (Loses 1 HP per minute
in no-mana areas); Doesn�ft Breathe; Doesn�ft Eat or Drink;
Doesn�ft Sleep; High Pain Threshold; Immunity to Disease;
Immunity to Mind Control; Immunity to Poison; Indomitable;
Mute; No Blood; No Brain; No Eyes; No Sense of
Smell/Taste; No Vitals; Reprogrammable; Single-Minded;
Skinny; Temperature Tolerance 5 (Cold); Temperature
Tolerance 5 (Heat); Unfazeable; Unhealing (Total); Unliving;
Unnatural; Vulnerability (Crushing).
Skills: Bow-14; Brawling-14; Climbing-13; Knife-13; Shield-14;
Stealth-13; one of Axe/Mace-14, Shortsword-14, or
Spear-14.
Class: Undead.
Notes: Skull DR is still only 2. Unaffected by Death Vision or
Sense Life, but susceptible to Pentagram, Sense Spirit, and
Turn Zombie. This skeleton is made from a bandit, castle
guard, militiaman, or other low-end warrior, and equipped
as a skirmisher and archer: one-handed melee weapon,
small shield (DB 1), longbow, and 10-20 arrows. More
impressive fighters can have better combat stats and gear .
maybe even armor fit for a skeleton! Though not truly evil,
the magic animating it usually is. No undead servitor will
negotiate or reveal useful information.
`,
	// 4
	`Fire Elemental
A mobile flame with a roughly humanoid shape. In the
wild, these beings lurk in or near volcanoes and lava, but they
sometimes come out to play in (or set) wildfires. A fire elemental
is hard to harm: it has DR 6, is Diffuse, cannot be harmed
in any way by heat or fire, and tends to destroy wooden weapons
used to strike it!
ST: 15 HP: 17 Speed: 6.00
DX: 12 Will: 10 Move: 6/12
IQ: 8 Per: 8
HT: 12 FP: 12 SM: +1
Dodge: 9 Parry: N/A DR: 6
Fiery Blow (12): 1d burning + halo of flame, below. Reach
C, 1.
26 The Be stia ry
Firebolt (15): Costs 1 FP per use. 2d burning. Ranged, with
Acc 3, 1/2D 10, Max 100.
Halo of Flame: 2d burning to anyone touched by elemental
or touching it in close combat. This can destroy wooden
weapons (Damage to Objects, Exploits, pp. 55-56), though
the danger should be obvious beforehand.
Traits: Bad Temper (12); Diffuse; Doesn ft Breathe (but
see notes); Doesn ft Eat or Drink; Doesn ft Sleep;
Enhanced Move (Ground); Immunity to Disease;
Immunity to Heat/Fire; Immunity to Poison;
No Fine Manipulators; No Neck; Pyromania (9);
Weakness (1d HP if immersed in water, repeating
every minute).
Skills: Innate Attack (Projectile)-15.
Class: Elemental.
Notes: Fire elementals don ft breathe and can ft be
gassed or strangled, but require air in order to
burn, experiencing Suffocation (Exploits, p. 70)
without it: FP loss, and then HP loss until death. Summoned
elementals add Reprogrammable and Unnatural;
they vanish instantly if wounded to -1HP, and can also be
dismissed by the Banish spell (Spells, pp. 59-60).

`,
	// 5
	`ST: 23 HP: 23 Speed: 6.50
DX: 14 Will: 13 Move: 10 (Air Move 13)
IQ: 5 Per: 12
HT: 12 FP: 12 SM: +1
Dodge: 10 Parry: 12 (�2) DR: 2
Dragon's Head (16): Bite or horns, 2d+2 cutting. Horns count
as weapon, not as body part, both to attack and parry!
Reach C, 1.
Fire Breath (16): 2d+1 burning in a 1-yard-wide � 10-yardlong
cone that inflicts large-area injury (Exploits, p. 53);
see Area and Spreading Attacks (Exploits, pp. 45-46). Costs
2 FP per use, with no recharge time or limit on uses/day.
Front Claw (16): 2d+2 cutting. Reach C, 1.
Goat's Head (16): Horns, 2d+2 impaling. Treat as weapon,
not as body part, both to attack and parry! Reach C, 1.
Hind Claw (14): 2d+3 cutting. Reach C, 1.
Lion's Head (16): Bite, 2d+2 cutting. Reach C, 1.
Serpent's Head (16): Bite (at only ST 18), 1d+2 impaling +
follow-up 2d toxic, or 1d with a successful HT roll. Reach
C, 1.
Traits: 360� Vision; Bad Temper (9); Combat Reflexes; DR
2 vs. heat/fire only; Extra Attack 3; Extra-Flexible; Extra
Heads 3; Flight (Winged); Night Vision 5; Penetrating
Voice; Quadruped; Temperature Tolerance 2 (Heat); Wild
Animal.
Skills: Brawling-16; Innate Attack (Breath)-16.
`,
	// 6
	`Zombie
Rotting corpses reanimated by dark necromancy . not by
strange contagion or other  gnatural h causes . are by far the
most common undead servitors. There isn ft a lich (p. 40) out
there without a small army of these, and vampires (pp. 58-59)
employ them as well. Zombies cannot be bribed or corrupted,
but their mental faculties are so limited that they fre useful
only as fodder in a fight, or for menial tasks such as turning
winches and carrying palanquins.
Truly evil monsters turn cadavers into zombies by binding
evil spirits within or using mass possession. Turning
(Adventurers, p. 21) affects such undead. However, possession
lets the reanimator share up to its own level of Resist Good
(p. 11) with its servants . maybe even borrow their senses!
Zombies are Unliving and slightly harder to injure, but also
Unnatural and thus dispelled at -1 HP.
ST: 13 HP: 17 Speed: 6.00
DX: 12 Will: 8 Move: 4
IQ: 8 Per: 8
HT: 12 FP: N/A SM: 0
Dodge: 8 Parry/Block: 9 DR: 2
Punch (13): 1d-1 crushing. Reach C.
Shield Bash (13): 1d crushing. Reach 1.
Weapon (12 or 13): Axe (2d+1 cutting), broadsword (2d cutting
or 1d+2 impaling), mace (2d+2 crushing), morningstar
(2d+2 crushing), etc. Reach 1.
Traits: Appearance (Monstrous); Automaton; Bad Smell;
Cannot Learn; Dependency (Loses 1 HP per minute in
no-mana areas); Disturbing Voice; Doesn ft Breathe;
Doesn ft Eat or Drink; Doesn ft Sleep; High Pain Threshold;
Immunity to Disease; Immunity to Mind Control;
Immunity to Poison; Indomitable; No Blood; No Sense of
Smell/Taste; Reprogrammable; Single-Minded; Temperature
Tolerance 5 (Cold); Temperature Tolerance 5 (Heat);
Unfazeable; Unhealing (Total); Unliving; Unnatural.
Skills: Brawling-13; Shield-13; Wrestling-13; one of
Axe/Mace-13, Broadsword-13, or Flail-12.
Class: Undead.
Notes: Unaffected by Death Vision or Sense Life, but susceptible
to Pentagram, Sense Spirit, and Turn Zombie. Effective
grappling ST is 14, thanks to Wrestling. This zombie is
made from a beefy gang enforcer, foot soldier, or similar
melee fighter, and equipped as a bargain-basement shock
trooper: one-handed melee weapon, medium shield (DB
2), and heavy leather armor (DR 2, included above). This
results in Light encumbrance, which is already figured into
the stats. Zombies will rot, eventually becoming skeletons
(pp. 47-48) if they last long enough . though some are preserved
as mummies with IQ 10, No Brain, and No Vitals,
but which catch fire and burn for 1d-1 injury per second if
they receive a major wound from fire. Not truly evil, though
the magic animating it usually is. No undead servitor will
negotiate or reveal useful information.
`,
	// 7
	`ST: 18 HP: 18 Speed: 6.00
DX: 12 Will: 10 Move: 9
IQ: 10 Per: 11
HT: 12 FP: 12 SM: 0
Dodge: 10 Parry: 11 (unarmed) DR: 15 (not vs. silver)
Bite or Claw (14): 2d+1 cutting. Reach C.
Traits: Acute Hearing 3; Acute Taste and Smell 3; Alternate
Form (Human); Appearance (Hideous); Bloodlust
(12); Combat Reflexes; Discriminatory Smell; Disturbing
Voice; Dread (Wolfsbane; 1 yard); Gluttony (12); High
Pain Threshold; Immunity to Disease; Immunity to Poison;
Night Vision 2; No Fine Manipulators; Odious Racial
Habit (Eats other sapient beings, .3 reactions); Penetrating
Voice; Recovery; Regeneration (1 HP/second, but not vs.
damage from silver); Silence 1; Striking ST 4; Temperature
Tolerance 5 (Cold); Vulnerability (Silver).
Skills: Brawling-14; Stealth-12 (13 vs. Hearing if moving, 14 if
motionless); Tracking-15.
Class: Mundane.
Notes: Hearing roll is 14 and Smell roll is 18 for detecting
delvers! Individuals may be bigger (more ST, HP, and
Striking ST), sneakier (higher Night Vision and Silence), or
more skilled. Clawed hands prevent weapon use. Against a
group carrying wolfsbane and bristling with silver weapons,
werewolves will stay hidden or pretend to be human .
but if they can�ft, they�fll negotiate. Truly evil.


`,
	// 8
	`ST: 15 HP: 15 Speed: 8.00
DX: 18 Will: 15 Move: 8
IQ: 12 Per: 15 Weight: 100.150 lbs.
HT: 13 FP: 13 SM: 0
Dodge: 12 Parry: 14 DR: 2 (Tough Skin)
Fright Check: -4 (once maw is open)
Bite (20): 3d+1 cutting. Often aimed at the neck; see text. May
bite and use webbing on the same turn. Reach C.
Punch (20): 1d+1 crushing. Reach C.
Webbing (20): Binding ST 25 (p. B40) with Engulfing and
Sticky. Range 50, Acc 3, RoF 10, Rcl 1. The rate of fire may
be split up among multiple foes; e.g., three strands at the
commando, three at the sage, and four
at the warrior, resolved as three separate
attacks.
Traits: Ambidexterity; Appearance
(Beautiful); Clinging;
Combat Reflexes; Danger
Sense; Extra Attack (see Webbing,
above); Honest Face;
Infravision; Injury Tolerance
(No Brain; No Vitals; Unliving;
see notes); Restricted Diet
(People); Striking ST 12 (Bite
Only; Nuisance Effect, Hideous
Appearance); Subsonic
Hearing; Super Jump 2.
Skills: Acrobatics-18; Acting-14;
Brawling-20; Innate Attack
(Projectile)-20; Musical Instrument
(varies)-12; Jumping-20;
Sex Appeal-15; Singing-14;
Stealth-20.
Notes: Living being!  gUnliving h
simply reflects its odd physiology.
As well, it has a brain
and vitals, but not where
you fd expect; knowing where
to stab requires a successful
roll against Biology at -4,
Hidden Lore (Cryptozoology),
Theology (Shamanic) at -2, or
Veterinary. In combat, can
leap 11 yards forward or three
yards straight up; double this
out of combat, double it with
a running start, quadruple it
for both.
`,
	// 9
	`Guards
ST 10; DX 10; IQ 9; HT 11.
Damage 1d-2/1d; BL 20 lbs.; HP 10; Will 9; Per 10; FP 11.
Basic Speed 5.25; Basic Move 5; Dodge 8; Parry 9 (Brawling).
5�6�-6�; 150-170 lbs.
Advantages/Disadvantages: Cantonese (Native).
Skills: Brawling-13; Guns/TL8 (Pistol)-12; Guns/TL8
(SMG)-12; Knife-14.
`,
	// 10
	`The Mate
ST 11; DX 12; IQ 10; HT 11.
Damage 1d-1/1d+1; BL 24 lbs.; HP 11; Will 10; Per 12; FP 11.
Basic Speed 5.75; Basic Move 5; Dodge 9; Parry 10 (Knife).
5�8�; 155 lbs.
Advantages/Disadvantages: Acute Hearing 2; Cantonese
(Native); Combat Reflexes.
Skills: Brawling-14; Guns/TL8 (Pistol)-14; Guns/TL8
(SMG)-14; Knife-15.
`,
	// 11
	`Notwithstanding the page name, this guy is not a Nazi party member. He's just a German soldier in 1939. His main motivation is the same as that of many young men like him in his day, patriotism.
This is a very generic German infantryman, with no special personal Traits, save the most common ones.
His Attributes and Skills reflect the fact that in 1939, the average soldier was pretty thoroughly trained and physically conditioned; also, he belongs to a first-class division, in which most privates would be young, healthy and bright for their age.
Height: 5'11", weight: 155 lbs., age: 21.
ST: 11 	HP: 11 	Speed: 5.5
DX: 11 	Will: 11 	Move: 4
IQ: 11 	Per: 11
HT: 11 	FP: 11 	SM: 0
Dodge: 7 	Parry: 8 	DR: 4,0,2

Mauser Karabiner 98K 7.92mm Mauser (13): 7d pi
Bayonet, Fine (7): 1d cut, Reach C,1; 1d imp, Reach C
Rifle-fixed bayonet thrust (10): 1d+3 imp, Reach 1,2*
Straight rifle-butt thrust (8): 1d+1 cr, Reach 1
Punch (12): 1d-2 cr, Reach C
Kick (10): 1d cr, Reach C,1

Traits: Addiction (Tobacco); Duty (Heer; 15 or less; Extremely Hazardous); Fanaticism (Patriotism); Fit.
Skills: Armoury/TL6 (Small Arms)-10; Brawling-12; Camouflage-11; Climibing-10; Explosives/TL6 (Demolition)-10; First Aid/TL6-11; Gambling-10; Gunner/TL6 (Machine Gun)-11; Guns/TL6 (Light Machine Gun)-12; Guns/TL6 (Rifle)-13; Hiking-10; Jumping-11; Navigation/TL6 (Land)-10; Savoir-Faire (Military)-11; Scrounging-11; Soldier/TL6-12; Spear-10; Stealth-10; Survival (Woodlands)-10; Swimming-11; Teamster (Equines)-10; Throwing-10; Traps/TL6-10.
`,
	// 12
	`Crystal Rat-Men
The process which changes giant rats into rat-men imbues
some with strange abilities. Crystal rat-men have long crystalline
claws which cut through armor easily, and their skin
is studded with lumps of translucent stone which provide a
modicum of protection. They can even hurl needle-like crystal
spines (which shatter into uselessness after impact) at enemies
with a flick of the hand.
ST: 11 HP: 11 Speed: 6.50
DX: 13 Will: 10 Move: 6
IQ: 7 Per: 10
HT: 13 FP: 13 SM: 0
Dodge: 9 Parry: 10 (unarmed) DR: 2
Bite (15): 1d-(2) cutting. Reach C.
Kick (13): 1d(2) cutting. Reach C, 1.
Punch (15): 1d-1(2) cutting. Reach C.
Thrown Spine (15): 1d-2(2) impaling. Ranged, with Acc 0,
1/2D 5, Max 11.
Traits: Appearance (Ugly); Berserk (12); Fanaticism; High
Pain Threshold; Night Vision 5; Resistant to Disease 5;
Resistant to Poison 5; Spider Climb (Move 4).
Skills: Brawling-15; Innate Attack (Projectile)-15; Stealth-12.
Class: Mundane.
Notes: Unlike regular rat-men, crystal rat-men attack barehanded
but are capable of innate ranged attacks. However,
crystal rat-men are liable to be overtaken by rage when
they fight, so their battles tend to end spectacularly, one
way or another.`,
	// 13
	`Tsorvano
273 points
Tsorvano is an ex-brigand who met Halmaro years
ago at sword�s point, while Halmaro was an aggressive
young caravan-master. Neither one will say who won
that first encounter, but soon afterward Tsorvano
became the merchant�s loyal henchman.
Tsorvano wears his broadsword for everyday use, but
if he expects trouble, he�ll sling his greatsword on his back.
Early 40s; Swarthy, bald, hooked nose, brilliant
green eyes; 6�4�, 220 lbs.
Attributes: ST 13 [30], DX 14 [80], IQ 13 [60], HT 12
[20]
Secondary Characteristics: Dmg 1d/2d-1, BL 34, HP
13, Will 13, Per 13, FP 12, Basic Speed 6.50, Basic
Move 6, Dodge 9, Parry 11.
No armor, no encumbrance.
Advantages: Damage Resistance DR 1 (Tough Skin,
-40%) [3]; Wealth (Wealthy) [20].
Disadvantages: Miserly (12) [-10]; Sense of Duty
(Halmaro and Guild) [-10]; Stubborn [-5].
Quirks: Dotes on Halmaro�s daughters; Dislikes clerics,
will always wear the minimum for comfort and propriety;
Enjoys embarrassing his inferiors; Likes
open spaces; Very cold to strangers. [-5]
Skills: Broadsword (A) DX+2 [8]-16; Desert Survival
(A) Per+3 [12]-16; Fast-Draw (Two-Handed Sword)
(E) DX [1]-14; Fast-Draw (Knife) (E) DX [1]-14;
Fast-Talk (A) IQ+2 [8]-15; Knife (E) DX+3 [8]-17;
Kalba (musical instrument) (H) IQ+1 [8]-14;
Merchant (A) IQ+3 [12]-16; Mountain Survival (A)
Per+2 [8]-15; Two-Handed Sword (A) DX+3 [12]-17.
Languages: Lantrai-Native [0] (default); Shandassa-
Native [6]; Nomic-Native [6]; Ayuni Trade Pidgin-
Broken [0] (default).
Weapons: Broadsword: 2 dice cutting, 1d+1 crushing;
Greatsword: 2d+2 cutting, 1d+2 crushing; Large
Knife: 2d-3 cutting, 1 die impaling.`
]
