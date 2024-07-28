import { Quench, QuenchBatchContext } from "@ethaks/fvtt-quench"
import { SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { EXAMPLE_STATBLOCKS, Mook } from "@system/mook/index.ts"
import { difficulty } from "@util"
import { _defaultMookData } from "tests/mocks/game.ts"

export function registerBatches(quench: Quench) {
	quench.registerBatch(
		`${SYSTEM_NAME}.mook.spells`,
		(context: QuenchBatchContext) => {
			const { describe, it, expect, before } = context

			let _mook: Mook

			describe("Spells with name-level notation, no points, no specializations, no RSL, no attributes", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[14])
				})

				it("Apportation", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Apportation" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Deflect Missile", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Deflect Missile" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Missile Shield", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Missile Shield" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Poltergeist", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Poltergeist" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Winged Knife", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Winged Knife" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Innate Attack (Projectile)", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Innate Attack (Projectile)" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Bravery", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Bravery" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Fear", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Fear" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Itch", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Itch" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Pain", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Pain" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Panic", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Panic" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Sense Emotion", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Sense Emotion" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Sense Foes", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Sense Foes" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Spasm", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Spasm" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Terror", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Terror" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Create Fire", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Create Fire" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Fireball", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Fireball" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Ignite Fire", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Ignite Fire" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Shape Fire", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Shape Fire" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Innate Attack (Projectile)", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Innate Attack (Projectile)" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Blur", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Blur" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Continual Light", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Continual Light" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Flash", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Flash" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Gloom", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Gloom" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Hide", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Hide" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Invisibility", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Invisibility" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
				it("Light", () => {
					expect(
						_mook.spells.some(
							s =>
								s.name === "Light" &&
								s.level === 15 &&
								s.attribute.toLowerCase() === gid.Intelligence &&
								s.difficulty.toLowerCase() === difficulty.Level.Hard &&
								s.points === 0,
						),
					).to.equal(true)
				})
			})
		},
		{ displayName: "Mook Generator: Spell Parsing" },
	)
}
