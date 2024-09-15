// import { Quench, QuenchBatchContext } from "@ethaks/fvtt-quench"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
// import { EXAMPLE_STATBLOCKS, Mook } from "@system/mook/index.ts"
// import { _defaultMookData } from "tests/mocks/game.ts"
//
// export function registerBatches(quench: Quench): void {
// 	quench.registerBatch(
// 		`${SYSTEM_NAME}.mook.traits`,
// 		(context: QuenchBatchContext) => {
// 			const { describe, it, expect, before } = context
//
// 			let _mook: Mook
//
// 			describe("Traits with CR, levels, no points, no modifiers", () => {
// 				before(() => {
// 					_mook = new Mook(_defaultMookData)
// 					_mook.parseStatblock(EXAMPLE_STATBLOCKS[0])
// 				})
// 				it("Appearance (Ugly)", () => {
// 					expect(_mook.traits.some(t => t.name === "Appearance (Ugly)" && t.points === 0)).to.equal(true)
// 				})
// 				it("Cowardice", () => {
// 					expect(_mook.traits.some(t => t.name === "Cowardice" && t.cr === 12 && t.points === 0)).to.equal(
// 						true,
// 					)
// 				})
// 				it("Infravision", () => {
// 					expect(_mook.traits.some(t => t.name === "Infravision" && t.points === 0)).to.equal(true)
// 				})
// 				it("Rapid Healing", () => {
// 					expect(_mook.traits.some(t => t.name === "Rapid Healing" && t.points === 0)).to.equal(true)
// 				})
// 				it("Resistant to Disease", () => {
// 					expect(
// 						_mook.traits.some(t => t.name === "Resistant to Disease" && t.levels === 5 && t.points === 0),
// 					).to.equal(true)
// 				})
// 				it("Resistant to Poison", () => {
// 					expect(
// 						_mook.traits.some(t => t.name === "Resistant to Poison" && t.levels === 5 && t.points === 0),
// 					).to.equal(true)
// 				})
// 				it("Social Stigma (Savage)", () => {
// 					expect(_mook.traits.some(t => t.name === "Social Stigma (Savage)" && t.points === 0)).to.equal(true)
// 				})
// 			})
//
// 			describe("Traits with modifiers, points, levels, CR", () => {
// 				before(() => {
// 					_mook = new Mook(_defaultMookData)
// 					_mook.parseStatblock(EXAMPLE_STATBLOCKS[13])
// 					console.log(_mook.traits)
// 				})
// 				it("Tough Skin", () => {
// 					expect(
// 						_mook.traits.some(
// 							t =>
// 								t.name === "Damage Resistance DR" &&
// 								t.levels === 1 &&
// 								t.modifiers[0].name === "Tough Skin" &&
// 								t.modifiers[0].cost === "-40%" &&
// 								t.points === 3,
// 						),
// 					).to.equal(true)
// 				})
// 				it("Wealth (Wealthy)", () => {
// 					expect(_mook.traits.some(t => t.name === "Wealth (Wealthy)" && t.points === 20)).to.equal(true)
// 				})
// 				it("Miserly", () => {
// 					expect(_mook.traits.some(t => t.name === "Miserly" && t.cr === 12 && t.points === -10)).to.equal(
// 						true,
// 					)
// 				})
// 				it("Sense of Duty (Halmaro and Guild)", () => {
// 					expect(
// 						_mook.traits.some(t => t.name === "Sense of Duty (Halmaro and Guild)" && t.points === -10),
// 					).to.equal(true)
// 				})
// 				it("Stubborn", () => {
// 					expect(_mook.traits.some(t => t.name === "Stubborn" && t.points === -5)).to.equal(true)
// 				})
// 				it("Dotes on Halmaros daughters", () => {
// 					expect(_mook.traits.some(t => t.name === "Dotes on Halmaros daughters" && t.points === 0)).to.equal(
// 						true,
// 					)
// 				})
// 				it("Dislikes clerics", () => {
// 					expect(_mook.traits.some(t => t.name === "Dislikes clerics" && t.points === 0)).to.equal(true)
// 				})
// 				it("will always wear the minimum for comfort and propriety", () => {
// 					expect(
// 						_mook.traits.some(
// 							t => t.name === "will always wear the minimum for comfort and propriety" && t.points === 0,
// 						),
// 					).to.equal(true)
// 				})
// 				it("Enjoys embarrassing his inferiors", () => {
// 					expect(
// 						_mook.traits.some(t => t.name === "Enjoys embarrassing his inferiors" && t.points === 0),
// 					).to.equal(true)
// 				})
// 				it("Likes open spaces", () => {
// 					expect(_mook.traits.some(t => t.name === "Likes open spaces" && t.points === 0)).to.equal(true)
// 				})
// 				it("Very cold to strangers", () => {
// 					expect(_mook.traits.some(t => t.name === "Very cold to strangers" && t.points === -5)).to.equal(
// 						true,
// 					)
// 				})
// 			})
// 		},
// 		{ displayName: "Mook Generator: Trait Parsing" },
// 	)
// }
