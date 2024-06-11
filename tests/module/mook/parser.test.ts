import { gid } from "@module/data/index.ts"
import { EXAMPLE_STATBLOCKS, Mook, MookParser } from "@system"
import { difficulty } from "@util/enum/difficulty.ts"
import { MockGame, _defaultMookData } from "tests/mocks/game.ts"

// Add real tests here.
describe("Mook generator", () => {
	let _mook: Mook
	let _parser: MookParser

	beforeEach(() => {
		_mook = new Mook(_defaultMookData)
		_parser = new MookParser("", _mook)
		// @ts-expect-error game does not exist on globalThis type
		global.game = new MockGame()
	})

	describe("Attribute Parsing", () => {
		it("Attributes separated by spaces and newlines", () => {
			_parser.text = EXAMPLE_STATBLOCKS[0]
			_parser.parseStatBlock(_parser.text)

			_mook.refreshAttributes()
			expect(_mook.system.attributes.find(e => e.id === gid.Strength)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Dexterity)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Intelligence)?.adj).toBe(-1)
			expect(_mook.system.attributes.find(e => e.id === gid.Health)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Will)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.FrightCheck)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Perception)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Vision)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Hearing)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.TasteSmell)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Touch)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicSpeed)?.adj).toBe(0.5)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicMove)?.adj).toBe(-2)
			expect(_mook.system.attributes.find(e => e.id === gid.FatiguePoints)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.HitPoints)?.adj).toBe(1)
		})

		it("Attributes separated by ; and newlines", () => {
			_parser.text = EXAMPLE_STATBLOCKS[9]
			_parser.parseStatBlock(_parser.text)

			_mook.refreshAttributes()
			expect(_mook.system.attributes.find(e => e.id === gid.Strength)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Dexterity)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Intelligence)?.adj).toBe(-1)
			expect(_mook.system.attributes.find(e => e.id === gid.Health)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Will)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.FrightCheck)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Perception)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Vision)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Hearing)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.TasteSmell)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Touch)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicSpeed)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicMove)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.FatiguePoints)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.HitPoints)?.adj).toBe(0)
		})

		it("Attributes separated by , and newlines, points added", () => {
			_parser.text = EXAMPLE_STATBLOCKS[13]
			_parser.parseStatBlock(_parser.text)

			_mook.refreshAttributes()
			expect(_mook.system.attributes.find(e => e.id === gid.Strength)?.adj).toBe(3)
			expect(_mook.system.attributes.find(e => e.id === gid.Dexterity)?.adj).toBe(4)
			expect(_mook.system.attributes.find(e => e.id === gid.Intelligence)?.adj).toBe(3)
			expect(_mook.system.attributes.find(e => e.id === gid.Health)?.adj).toBe(2)
			expect(_mook.system.attributes.find(e => e.id === gid.Will)?.adj).toBe(-1)
			expect(_mook.system.attributes.find(e => e.id === gid.FrightCheck)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Perception)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.Vision)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Hearing)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.TasteSmell)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.Touch)?.adj).toBe(0)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicSpeed)?.adj).toBe(0.25)
			expect(_mook.system.attributes.find(e => e.id === gid.BasicMove)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.FatiguePoints)?.adj).toBe(1)
			expect(_mook.system.attributes.find(e => e.id === gid.HitPoints)?.adj).toBe(-1)
		})
	})

	describe("Trait Parsing", () => {
		it("Traits with CR, levels, no points, no modifiers", () => {
			_parser.text = EXAMPLE_STATBLOCKS[0]
			_parser.parseStatBlock(_parser.text)

			expect(_mook.traits.some(t => t.name === "Appearance (Ugly)" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Cowardice" && t.cr === 12 && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Infravision" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Rapid Healing" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Resistant to Disease" && t.levels === 5 && t.points === 0)).toBe(
				true,
			)
			expect(_mook.traits.some(t => t.name === "Resistant to Poison" && t.levels === 5 && t.points === 0)).toBe(
				true,
			)
			expect(_mook.traits.some(t => t.name === "Social Stigma (Savage)" && t.points === 0)).toBe(true)
		})

		it("Traits with modifiers, points, levels, CR", () => {
			_parser.text = EXAMPLE_STATBLOCKS[13]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.traits.some(
					t =>
						t.name === "Damage Resistance DR" &&
						t.levels === 1 &&
						t.modifiers[0].name === "Tough Skin" &&
						t.modifiers[0].cost === "-40%" &&
						t.points === 3,
				),
			).toBe(true)
			expect(_mook.traits.some(t => t.name === "Wealth (Wealthy)" && t.points === 20)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Miserly" && t.cr === 12 && t.points === -10)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Sense of Duty (Halmaro and Guild)" && t.points === -10)).toBe(
				true,
			)
			expect(_mook.traits.some(t => t.name === "Stubborn" && t.points === -5)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Dotes on Halmaros daughters" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Dislikes clerics" && t.points === 0)).toBe(true)
			expect(
				_mook.traits.some(
					t => t.name === "will always wear the minimum for comfort and propriety" && t.points === 0,
				),
			).toBe(true)
			expect(_mook.traits.some(t => t.name === "Enjoys embarrassing his inferiors" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Likes open spaces" && t.points === 0)).toBe(true)
			expect(_mook.traits.some(t => t.name === "Very cold to strangers" && t.points === -5)).toBe(true)
		})
	})

	describe("Skill Parsing", () => {
		it("Skills with name-level notation, no points, no specializations, no RSL, no attributes", () => {
			_parser.text = EXAMPLE_STATBLOCKS[0]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.skills.some(
					s =>
						s.name === "Bow" &&
						s.level === 13 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Brawling" &&
						s.level === 13 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Knife" &&
						s.level === 13 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Shield" &&
						s.level === 12 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Stealth" &&
						s.level === 12 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
		})

		it("Skills with name-level notation, no points, no specializations, no RSL, no attributes, odd linebreaks", () => {
			_parser.text = EXAMPLE_STATBLOCKS[2]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.skills.some(
					s =>
						s.name === "Acrobatics" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Brawling" &&
						s.level === 18 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Climbing" &&
						s.level === 18 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Cloak" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Escape" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Filch" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Forced Entry" &&
						s.level === 17 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Garrote" &&
						s.level === 18 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Holdout" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Knife" &&
						s.level === 18 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Lockpicking" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Observation" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Pickpocket" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Search" &&
						s.level === 17 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Shadowing" &&
						s.level === 14 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Shortsword" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Staff" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Stealth" &&
						s.level === 18 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Tactics" &&
						s.level === 12 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Traps" &&
						s.level === 14 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 0,
				),
			).toBe(true)
		})

		it("Skills with points, difficulty, RSL, specialization, name, levels", () => {
			_parser.text = EXAMPLE_STATBLOCKS[13]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.skills.some(
					s =>
						s.name === "Broadsword" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 8,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Desert Survival" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Perception &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 12,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Fast-Draw" &&
						s.specialization === "Two-Handed Sword" &&
						s.level === 14 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Easy &&
						s.points === 1,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Fast-Draw" &&
						s.specialization === "Knife" &&
						s.level === 14 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Easy &&
						s.points === 1,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Fast-Talk" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 8,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Knife" &&
						s.level === 17 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Easy &&
						s.points === 8,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Kalba" &&
						s.specialization === "musical instrument" &&
						s.level === 14 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 8,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Merchant" &&
						s.level === 16 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 12,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Mountain Survival" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Perception &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 8,
				),
			).toBe(true)
			expect(
				_mook.skills.some(
					s =>
						s.name === "Two-Handed Sword" &&
						s.level === 17 &&
						s.attribute.toLowerCase() === gid.Dexterity &&
						s.difficulty.toLowerCase() === difficulty.Level.Average &&
						s.points === 12,
				),
			).toBe(true)
		})
	})

	describe("Spell Parsing", () => {
		it("Spells with name-level notation, no points, no specializations, no RSL, no attributes", () => {
			_parser.text = EXAMPLE_STATBLOCKS[14]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.spells.some(
					s =>
						s.name === "Apportation" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Deflect Missile" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Missile Shield" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Poltergeist" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Winged Knife" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Innate Attack (Projectile)" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Bravery" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Fear" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Itch" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Pain" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Panic" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Sense Emotion" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Sense Foes" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Spasm" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Terror" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Create Fire" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Fireball" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Ignite Fire" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Shape Fire" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Innate Attack (Projectile)" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Blur" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Continual Light" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Flash" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Gloom" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Hide" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Invisibility" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
			expect(
				_mook.spells.some(
					s =>
						s.name === "Light" &&
						s.level === 15 &&
						s.attribute.toLowerCase() === gid.Intelligence &&
						s.difficulty.toLowerCase() === difficulty.Level.Hard &&
						s.points === 0,
				),
			).toBe(true)
		})
	})

	describe("Attack parsing", () => {
		it("Attacks separated by . and newlines, some armor divisors, notes, long form damage types", () => {
			_parser.text = EXAMPLE_STATBLOCKS[0]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.melee.some(
					w =>
						w.name === "Bite" &&
						w.level === 13 &&
						w.reach === "C" &&
						w.damage.type === "cut" &&
						w.damage.base === "1d-1",
				),
			).toBe(true)
			expect(
				_mook.melee.some(
					w =>
						w.name === "Kick" &&
						w.level === 11 &&
						w.reach === "C, 1" &&
						w.damage.type === "cr" &&
						w.damage.base === "1d+1",
				),
			).toBe(true)
			expect(
				_mook.melee.some(
					w =>
						w.name === "Long Knife" &&
						w.level === 13 &&
						w.reach === "C, 1" &&
						w.damage.type === "cut" &&
						w.damage.base === "1d",
				),
			).toBe(true)
			expect(
				_mook.melee.some(
					w =>
						w.name === "Punch" &&
						w.level === 13 &&
						w.reach === "C" &&
						w.damage.type === "cr" &&
						w.damage.base === "1d-1",
				),
			).toBe(true)
			expect(
				_mook.melee.some(
					w =>
						w.name === "Shield Bash" &&
						w.level === 12 &&
						w.reach === "1" &&
						w.damage.type === "cr" &&
						w.damage.base === "1d-1",
				),
			).toBe(true)
			expect(
				_mook.ranged.some(
					w =>
						w.name === "Short Bow" &&
						w.level === 13 &&
						w.damage.type === "pi" &&
						w.damage.base === "1d-1" &&
						w.damage.armor_divisor === 2 &&
						w.accuracy === "1" &&
						w.range === "110/165" &&
						w.shots === "1(2)" &&
						w.bulk === "-6",
				),
			).toBe(true)
		})

		it("Attacks separated by . and newlines, some armor divisors, notes, long form damage types, random interrupting line", () => {
			_parser.text = EXAMPLE_STATBLOCKS[4]
			_parser.parseStatBlock(_parser.text)

			expect(
				_mook.melee.some(
					w =>
						w.name === "Fiery Blow" &&
						w.level === 12 &&
						w.reach === "C, 1" &&
						w.damage.type === "burn" &&
						w.damage.base === "1d",
				),
			).toBe(true)
			expect(
				_mook.ranged.some(
					w =>
						w.name === "Firebolt" &&
						w.level === 15 &&
						w.damage.type === "burn" &&
						w.damage.base === "2d" &&
						w.accuracy === "3" &&
						w.range === "10/100",
				),
			).toBe(true)
		})
	})
})
