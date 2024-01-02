import { ActorFlags } from "@actor/base/data"
import { gid, SYSTEM_NAME } from "@module/data"
import { sanitizeId, VariableResolver } from "@util"
import { AttributeDef } from "./attribute_def"
import { AttributeObj, reserved_ids } from "./data"
import { PoolThreshold } from "./pool_threshold"
import { attribute, stlimit } from "@util/enum"

// interface Mook {
// 	resolveVariable: (variableName: string) => string
// 	skills:  MookSkill[]
// 	traits:  MookTrait[]
// 	attributeBonusFor
// 	isSkillLevelResolutionExcluded: (name: string, specialization: string) => boolean
// 	registerSkillLevelResolutionExclusion: (name: string, specialization: string) => void
// 	unregisterSkillLevelResolutionExclusion: (name: string, specialization: string) => void
// 	encumbranceLevel: (forSkills: boolean) => {
// 		level: number
// 		maximum_carry: number
// 		penalty: number
// 		name: string
// 	}
// }

export class Attribute {
	actor: VariableResolver

	order: number

	private attr_id: string

	adj = 0

	damage?: number

	apply_ops?: boolean

	_overridenThreshold?: PoolThreshold | null = null

	constructor(actor: VariableResolver, attr_id: string, order: number, data?: Partial<AttributeObj>) {
		if (data) Object.assign(this, data)
		this.actor = actor
		this.attr_id = attr_id
		this.order = order
		if (this.attribute_def.type === attribute.Type.Pool) {
			this.apply_ops ??= true
		}
	}

	get bonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None)
	}

	get effectiveBonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None, true, null)
	}

	get cost_reduction(): number {
		if (!this.actor) return 0
		return this.actor.costReductionFor(this.id)
	}

	get id(): string {
		return this.attr_id
	}

	set id(v: string) {
		this.attr_id = sanitizeId(v, false, reserved_ids)
	}

	get attribute_def(): AttributeDef {
		return new AttributeDef(this.actor.settings.attributes.find(e => e.id === this.attr_id))
	}

	get max(): number {
		const def = this.attribute_def
		if (!def) return 0
		let max = def.baseValue(this.actor) + this.adj + this.bonus
		if (![attribute.Type.Decimal, attribute.Type.DecimalRef].includes(def.type)) {
			return Math.floor(max)
		}
		return max
	}

	set max(v: number) {
		if (this.max === v) return
		const def = this.attribute_def
		if (def) this.adj = v - (def.baseValue(this.actor) + this.bonus)
	}

	get effective(): number {
		return this._effective()
	}

	_effective(bonus = 0): number {
		const def = this.attribute_def
		if (!def) return 0
		let effective = this.max + this.effectiveBonus + bonus
		if (![attribute.Type.Decimal, attribute.Type.DecimalRef].includes(def.type)) {
			effective = Math.floor(effective)
		}
		if (this.id === gid.Strength) return this.actor.effectiveST(effective)
		return effective
	}

	get current(): number {
		const max = this.max
		const def = this.attribute_def
		if (!def || def.type !== attribute.Type.Pool) {
			return max
		}
		return max - (this.damage ?? 0)
	}

	set current(v: number) {
		this.max = v
	}

	private get _manualThreshold(): PoolThreshold | null {
		return (this.actor.getFlag(SYSTEM_NAME, ActorFlags.AutoThreshold) as any).manual[this.id] || null
	}

	get currentThreshold(): Partial<PoolThreshold> | null {
		const def = this.attribute_def
		if (!def) return null
		if (
			[attribute.Type.PrimarySeparator, attribute.Type.SecondarySeparator, attribute.Type.PoolSeparator].includes(
				def.type
			)
		)
			return null
		if (this._overridenThreshold) return this._overridenThreshold
		if (!(this.actor.getFlag(SYSTEM_NAME, ActorFlags.AutoThreshold) as any).active) return this._manualThreshold
		const cur = this.current
		if (def.thresholds) {
			for (const t of def.thresholds) {
				if (cur <= t.threshold!(this.actor)) return t
			}
		}
		return null
	}

	get points(): number {
		const def = this.attribute_def
		if (!def) return 0
		let sm = 0
		if (this.actor) sm = this.actor.adjustedSizeModifier
		return def.computeCost(this.actor, this.adj, this.cost_reduction, sm)
	}

	toObj(): AttributeObj {
		const obj: AttributeObj = {
			// Bonus: this.bonus,
			// cost_reduction: this.costReduction,
			// order: this.order,
			attr_id: this.attr_id,
			adj: this.adj,
		}
		if (this.damage) obj.damage = this.damage
		return obj
	}
}
