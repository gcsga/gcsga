import { Quench, QuenchBatchContext } from "@ethaks/fvtt-quench"
import { SYSTEM_NAME } from "@module/data/constants.ts"
import { EXAMPLE_STATBLOCKS, Mook } from "@system/mook/index.ts"
import { _defaultMookData } from "tests/mocks/game.ts"

export function registerBatches(quench: Quench) {
	quench.registerBatch(
		`${SYSTEM_NAME}.mook.attacks`,
		(context: QuenchBatchContext) => {
			const { describe, it, expect, before } = context

			let _mook: Mook

			describe("Attacks separated by . and newlines, some armor divisors, notes, long form damage types", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[0])
					console.log(_mook.melee)
					console.log(_mook.ranged)
				})

				it("Bite", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Bite" &&
								w.level === 13 &&
								w.reach === "C" &&
								w.damage.type === "cut" &&
								w.damage.base === "1d-1",
						),
					).to.equal(true)
				})
				it("Kick", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Kick" &&
								w.level === 11 &&
								w.reach === "C, 1" &&
								w.damage.type === "cr" &&
								w.damage.base === "1d+1",
						),
					).to.equal(true)
				})
				it("Long Knife", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Long Knife" &&
								w.level === 13 &&
								w.reach === "C, 1" &&
								w.damage.type === "cut" &&
								w.damage.base === "1d",
						),
					).to.equal(true)
				})
				it("Punch", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Punch" &&
								w.level === 13 &&
								w.reach === "C" &&
								w.damage.type === "cr" &&
								w.damage.base === "1d-1",
						),
					).to.equal(true)
				})
				it("Shield Bash", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Shield Bash" &&
								w.level === 12 &&
								w.reach === "1" &&
								w.damage.type === "cr" &&
								w.damage.base === "1d-1",
						),
					).to.equal(true)
				})
				it("Short Bow", () => {
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
					).to.equal(true)
				})
			})

			describe("Attacks separated by . and newlines, some armor divisors, notes, long form damage types, random interrupting line", () => {
				before(() => {
					_mook = new Mook(_defaultMookData)
					_mook.parseStatblock(EXAMPLE_STATBLOCKS[4])
				})

				it("Fiery Blow", () => {
					expect(
						_mook.melee.some(
							w =>
								w.name === "Fiery Blow" &&
								w.level === 12 &&
								w.reach === "C, 1" &&
								w.damage.type === "burn" &&
								w.damage.base === "1d",
						),
					).to.equal(true)
				})
				it("Firebolt", () => {
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
					).to.equal(true)
				})
			})
		},
		{ displayName: "Mook Generator: Attack Parsing" },
	)
}
