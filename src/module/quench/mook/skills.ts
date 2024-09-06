import { Quench, QuenchBatchContext } from "@ethaks/fvtt-quench"
import { SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { EXAMPLE_STATBLOCKS, Mook } from "@system/mook/index.ts"
import { difficulty } from "@util"
import { _defaultMookData } from "tests/mocks/game.ts"

export function registerBatches(quench: Quench): void {
	quench.registerBatch(
		`${SYSTEM_NAME}.mook.skills`,
		(context: QuenchBatchContext) => {
			const { describe, it, expect, before } = context

			let _mook: Mook

			describe("Skills with name-level notation, no points, no specializations, no RSL, no attributes", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[0])
				})

				it("Bow", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Bow" &&
								s.level === 13 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Brawling", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Brawling" &&
								s.level === 13 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Knife", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Knife" &&
								s.level === 13 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Shield", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Shield" &&
								s.level === 12 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Stealth", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Stealth" &&
								s.level === 12 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
			})

			describe("Skills with name-level notation, no points, no specializations, no RSL, no attributes, odd linebreaks", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[2])
				})

				it("Acrobatics", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Acrobatics" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Brawling", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Brawling" &&
								s.level === 18 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Climbing", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Climbing" &&
								s.level === 18 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Cloak", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Cloak" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Escape", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Escape" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Filch", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Filch" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Forced Entry", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Forced Entry" &&
								s.level === 17 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Garrote", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Garrote" &&
								s.level === 18 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Holdout", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Holdout" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Knife", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Knife" &&
								s.level === 18 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Lockpicking", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Lockpicking" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Observation", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Observation" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Pickpocket", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Pickpocket" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Search", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Search" &&
								s.level === 17 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Shadowing", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Shadowing" &&
								s.level === 14 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Shortsword", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Shortsword" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Staff", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Staff" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Stealth", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Stealth" &&
								s.level === 18 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Tactics", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Tactics" &&
								s.level === 12 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Traps", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Traps" &&
								s.level === 14 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 0,
						),
					).to.equal(true)
				})
			})

			describe("Skills with points, difficulty, RSL, specialization, name, levels", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[13])
				})

				it("Broadsword", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Broadsword" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 8,
						),
					).to.equal(true)
				})
				it("Desert Survival", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Desert Survival" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Perception &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 12,
						),
					).to.equal(true)
				})
				it("Two-Handed Sword", () => {
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
					).to.equal(true)
				})
				it("Knife", () => {
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
					).to.equal(true)
				})
				it("Fast-Talk", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Fast-Talk" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 8,
						),
					).to.equal(true)
				})
				it("Knife", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Knife" &&
								s.level === 17 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Easy &&
								s.points === 8,
						),
					).to.equal(true)
				})
				it("musical instrument", () => {
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
					).to.equal(true)
				})
				it("Merchant", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Merchant" &&
								s.level === 16 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 12,
						),
					).to.equal(true)
				})
				it("Mountain Survival", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Mountain Survival" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Perception &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 8,
						),
					).to.equal(true)
				})
				it("Two-Handed Sword", () => {
					expect(
						_mook.skills.some(
							s =>
								s.name === "Two-Handed Sword" &&
								s.level === 17 &&
								s.attribute.toLowerCase() === gid.Dexterity &&
								s.difficulty.toLowerCase() === difficulty.Level.Average &&
								s.points === 12,
						),
					).to.equal(true)
				})
			})
		},
		{ displayName: "Mook Generator: Skill Parsing" },
	)
}
