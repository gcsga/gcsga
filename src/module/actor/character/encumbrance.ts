// import type { CharacterGURPS } from "@actor"
// import { Encumbrance } from "./data.ts"
// import { Int, LocalizeGURPS, stlimit } from "@util"
// import { ActorFlags, SYSTEM_NAME, gid } from "@module/data/constants.ts"
// import { AttributeGURPS, AttributeDef } from "@system"
//
// class CharacterEncumbrance<TOwner extends CharacterGURPS = CharacterGURPS> {
// 	owner: TOwner
//
// 	declare levels: Encumbrance[]
// 	declare current: Encumbrance
// 	declare forSkills: Encumbrance
// 	declare overencumbered: boolean
//
// 	constructor(owner: TOwner) {
// 		this.owner = owner
//
// 		this.levels = this._getLevels(this.owner.lifts.basicLift)
// 		this.current = this._getCurrentLevel(this.owner.weightCarried(false))
// 		this.levels[this.current.level].active = true
// 		this.forSkills = this._getCurrentLevel(this.owner.weightCarried(true))
// 		this.overencumbered = this._getOverencumbered(this.owner.weightCarried(false))
// 	}
//
// 	public get dodgeAttribute(): DeepPartial<AttributeGURPS> {
// 		return {
// 			id: gid.Dodge,
// 			definition: {
// 				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
// 			} as AttributeDef,
// 			effective: this.current.dodge.effective,
// 			current: this.current.dodge.effective,
// 		}
// 	}
//
// 	private _getLevels(basicLift: number): Encumbrance[] {
// 		const dodgeOps = Math.max(2 * Math.min(this.owner.countThresholdOpMet(threshold.Op.HalveDodge), 2), 1)
// 		const moveOps = Math.max(2 * Math.min(this.owner.countThresholdOpMet(threshold.Op.HalveMove), 2), 1)
//
// 		return [
// 			{
// 				level: 0,
// 				maximumCarry: Int.from(basicLift, 4),
// 				penalty: 0,
// 				name: LocalizeGURPS.translations.gurps.character.encumbrance[0],
// 				active: false,
// 				dodge: {
// 					normal: this.getDodge(0),
// 					effective: this.getDodge(0, dodgeOps),
// 				},
// 				move: {
// 					normal: this.getMove(0),
// 					effective: this.getMove(0, moveOps),
// 				},
// 			},
// 			{
// 				level: 1,
// 				maximumCarry: Int.from(basicLift * 2, 4),
// 				penalty: -1,
// 				name: LocalizeGURPS.translations.gurps.character.encumbrance[1],
// 				active: false,
// 				dodge: {
// 					normal: this.getDodge(-1),
// 					effective: this.getDodge(-1, dodgeOps),
// 				},
// 				move: {
// 					normal: this.getMove(-1),
// 					effective: this.getMove(-1, moveOps),
// 				},
// 			},
// 			{
// 				level: 2,
// 				maximumCarry: Int.from(basicLift * 3, 4),
// 				penalty: -2,
// 				name: LocalizeGURPS.translations.gurps.character.encumbrance[2],
// 				active: false,
// 				dodge: {
// 					normal: this.getDodge(-2),
// 					effective: this.getDodge(-2, dodgeOps),
// 				},
// 				move: {
// 					normal: this.getMove(-2),
// 					effective: this.getMove(-2, moveOps),
// 				},
// 			},
// 			{
// 				level: 3,
// 				maximumCarry: Int.from(basicLift * 6, 4),
// 				penalty: -3,
// 				name: LocalizeGURPS.translations.gurps.character.encumbrance[3],
// 				active: false,
// 				dodge: {
// 					normal: this.getDodge(-3),
// 					effective: this.getDodge(-3, dodgeOps),
// 				},
// 				move: {
// 					normal: this.getMove(-3),
// 					effective: this.getMove(-3, moveOps),
// 				},
// 			},
// 			{
// 				level: 4,
// 				maximumCarry: Int.from(basicLift * 10, 4),
// 				penalty: -4,
// 				name: LocalizeGURPS.translations.gurps.character.encumbrance[4],
// 				active: false,
// 				dodge: {
// 					normal: this.getDodge(-4),
// 					effective: this.getDodge(-4, dodgeOps),
// 				},
// 				move: {
// 					normal: this.getMove(-4),
// 					effective: this.getMove(-4, moveOps),
// 				},
// 			},
// 		]
// 	}
//
// 	private _getCurrentLevel(weightCarried: number): Encumbrance {
// 		const autoEncumbrance = this.owner.flags[SYSTEM_NAME]?.[ActorFlags.AutoEncumbrance] ?? { active: true }
// 		if (!autoEncumbrance.active) return this.levels[autoEncumbrance.manual || 0]
// 		for (const level of this.levels) {
// 			if (weightCarried <= level.maximumCarry) return level
// 		}
// 		return this.levels[this.levels.length - 1]
// 	}
//
// 	private _getOverencumbered(weightCarried: number): boolean {
// 		const lastLevel = this.levels[this.levels.length - 1]
// 		return weightCarried > lastLevel.maximumCarry
// 	}
//
// 	public getBaseMove(type: string): number {
// 		const move = this.owner.moveTypes.get(type)
// 		if (!move) return 0
// 		return move.base
// 	}
//
// 	public getDodge(penalty: number, divisor = 1): number {
// 		const basicSpeed = this.owner.attributes.has(gid.BasicSpeed)
// 			? Math.max(this.owner.resolveAttributeCurrent(gid.BasicSpeed), 0)
// 			: 0
// 		const baseDodge = Math.ceil(
// 			(basicSpeed + 3 + this.owner.attributeBonusFor(gid.Dodge, stlimit.Option.None)) / divisor,
// 		)
// 		return Math.max(baseDodge + penalty, 1)
// 	}
//
// 	public getMove(penalty: number, divisor = 1): number {
// 		const moveType = this.owner.flags[SYSTEM_NAME]?.[ActorFlags.MoveType] ?? gid.Ground
// 		const baseMove =
// 			(this.getBaseMove(moveType) + this.owner.attributeBonusFor(gid.BasicMove, stlimit.Option.None)) / divisor
// 		const finalMove = Math.trunc((baseMove * (10 + 2 * penalty)) / 10)
// 		if (finalMove < 1) return baseMove > 0 ? 1 : 0
// 		return finalMove
// 	}
// }
//
// export { CharacterEncumbrance }
