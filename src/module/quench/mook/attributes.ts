// import { Quench, QuenchBatchContext } from "@ethaks/fvtt-quench"
// import { SYSTEM_NAME, gid } from "@module/data/constants.ts"
// import { EXAMPLE_STATBLOCKS, Mook } from "@system/mook/index.ts"
// import { _defaultMookData } from "tests/mocks/game.ts"
//
// export function registerBatches(quench: Quench): void {
// 	quench.registerBatch(
// 		`${SYSTEM_NAME}.mook.attributes`,
// 		(context: QuenchBatchContext) => {
// 			const { describe, it, expect, before } = context
//
// 			let _mook: Mook
//
// 			describe("Attributes separated by spaces and newlines", () => {
// 				before(() => {
// 					_mook = new Mook(_defaultMookData)
// 					_mook.parseStatblock(EXAMPLE_STATBLOCKS[0])
// 				})
// 				it("Strength", () => {
// 					expect(_mook.attributes.get(gid.Strength)?.adj).to.equal(1)
// 				})
// 				it("Dexterity", () => {
// 					expect(_mook.attributes.get(gid.Dexterity)?.adj).to.equal(1)
// 				})
// 				it("Intelligence", () => {
// 					expect(_mook.attributes.get(gid.Intelligence)?.adj).to.equal(-1)
// 				})
// 				it("Health", () => {
// 					expect(_mook.attributes.get(gid.Health)?.adj).to.equal(1)
// 				})
// 				it("Will", () => {
// 					expect(_mook.attributes.get(gid.Will)?.adj).to.equal(1)
// 				})
// 				it("Fright Check", () => {
// 					expect(_mook.attributes.get(gid.FrightCheck)?.adj).to.equal(0)
// 				})
// 				it("Perception", () => {
// 					expect(_mook.attributes.get(gid.Perception)?.adj).to.equal(1)
// 				})
// 				it("Vision", () => {
// 					expect(_mook.attributes.get(gid.Vision)?.adj).to.equal(0)
// 				})
// 				it("Hearing", () => {
// 					expect(_mook.attributes.get(gid.Hearing)?.adj).to.equal(0)
// 				})
// 				it("Taste Smell", () => {
// 					expect(_mook.attributes.get(gid.TasteSmell)?.adj).to.equal(0)
// 				})
// 				it("Touch", () => {
// 					expect(_mook.attributes.get(gid.Touch)?.adj).to.equal(0)
// 				})
// 				it("Basic Speed", () => {
// 					expect(_mook.attributes.get(gid.BasicSpeed)?.adj).to.equal(0.5)
// 				})
// 				it("Basic Move", () => {
// 					expect(_mook.attributes.get(gid.BasicMove)?.adj).to.equal(-2)
// 				})
// 				it("Fatigue Points", () => {
// 					expect(_mook.attributes.get(gid.FatiguePoints)?.adj).to.equal(0)
// 				})
// 				it("Hit Points", () => {
// 					expect(_mook.attributes.get(gid.HitPoints)?.adj).to.equal(1)
// 				})
// 			})
//
// 			describe("Attributes separated by ; and newlines", () => {
// 				before(() => {
// 					_mook = new Mook(_defaultMookData)
// 					_mook.parseStatblock(EXAMPLE_STATBLOCKS[9])
// 				})
//
// 				it("Strength", () => {
// 					expect(_mook.attributes.get(gid.Strength)?.adj).to.equal(0)
// 				})
// 				it("Dexterity", () => {
// 					expect(_mook.attributes.get(gid.Dexterity)?.adj).to.equal(0)
// 				})
// 				it("Intelligence", () => {
// 					expect(_mook.attributes.get(gid.Intelligence)?.adj).to.equal(-1)
// 				})
// 				it("Health", () => {
// 					expect(_mook.attributes.get(gid.Health)?.adj).to.equal(1)
// 				})
// 				it("Will", () => {
// 					expect(_mook.attributes.get(gid.Will)?.adj).to.equal(0)
// 				})
// 				it("FrightCheck", () => {
// 					expect(_mook.attributes.get(gid.FrightCheck)?.adj).to.equal(0)
// 				})
// 				it("Perception", () => {
// 					expect(_mook.attributes.get(gid.Perception)?.adj).to.equal(1)
// 				})
// 				it("Vision", () => {
// 					expect(_mook.attributes.get(gid.Vision)?.adj).to.equal(0)
// 				})
// 				it("Hearing", () => {
// 					expect(_mook.attributes.get(gid.Hearing)?.adj).to.equal(0)
// 				})
// 				it("TasteSmell", () => {
// 					expect(_mook.attributes.get(gid.TasteSmell)?.adj).to.equal(0)
// 				})
// 				it("Touch", () => {
// 					expect(_mook.attributes.get(gid.Touch)?.adj).to.equal(0)
// 				})
// 				it("BasicSpeed", () => {
// 					expect(_mook.attributes.get(gid.BasicSpeed)?.adj).to.equal(0)
// 				})
// 				it("BasicMove", () => {
// 					expect(_mook.attributes.get(gid.BasicMove)?.adj).to.equal(0)
// 				})
// 				it("FatiguePoints", () => {
// 					expect(_mook.attributes.get(gid.FatiguePoints)?.adj).to.equal(0)
// 				})
// 				it("HitPoints", () => {
// 					expect(_mook.attributes.get(gid.HitPoints)?.adj).to.equal(0)
// 				})
// 			})
//
// 			describe("Attriubte Parsing: Attributes separated by , and newlines, points added", () => {
// 				before(() => {
// 					_mook = new Mook(_defaultMookData)
// 					_mook.parseStatblock(EXAMPLE_STATBLOCKS[13])
// 				})
//
// 				it("Strength", () => {
// 					expect(_mook.attributes.get(gid.Strength)?.adj).to.equal(3)
// 				})
// 				it("Dexterity", () => {
// 					expect(_mook.attributes.get(gid.Dexterity)?.adj).to.equal(4)
// 				})
// 				it("Intelligence", () => {
// 					expect(_mook.attributes.get(gid.Intelligence)?.adj).to.equal(3)
// 				})
// 				it("Health", () => {
// 					expect(_mook.attributes.get(gid.Health)?.adj).to.equal(2)
// 				})
// 				it("Will", () => {
// 					expect(_mook.attributes.get(gid.Will)?.adj).to.equal(-1)
// 				})
// 				it("FrightCheck", () => {
// 					expect(_mook.attributes.get(gid.FrightCheck)?.adj).to.equal(0)
// 				})
// 				it("Perception", () => {
// 					expect(_mook.attributes.get(gid.Perception)?.adj).to.equal(1)
// 				})
// 				it("Vision", () => {
// 					expect(_mook.attributes.get(gid.Vision)?.adj).to.equal(0)
// 				})
// 				it("Hearing", () => {
// 					expect(_mook.attributes.get(gid.Hearing)?.adj).to.equal(0)
// 				})
// 				it("TasteSmell", () => {
// 					expect(_mook.attributes.get(gid.TasteSmell)?.adj).to.equal(0)
// 				})
// 				it("Touch", () => {
// 					expect(_mook.attributes.get(gid.Touch)?.adj).to.equal(0)
// 				})
// 				it("BasicSpeed", () => {
// 					expect(_mook.attributes.get(gid.BasicSpeed)?.adj).to.equal(0.25)
// 				})
// 				it("BasicMove", () => {
// 					expect(_mook.attributes.get(gid.BasicMove)?.adj).to.equal(1)
// 				})
// 				it("FatiguePoints", () => {
// 					expect(_mook.attributes.get(gid.FatiguePoints)?.adj).to.equal(1)
// 				})
// 				it("HitPoints", () => {
// 					expect(_mook.attributes.get(gid.HitPoints)?.adj).to.equal(-1)
// 				})
// 			})
// 		},
// 		{ displayName: "Mook Generator: Attribute Parsing" },
// 	)
// }
