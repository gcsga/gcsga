import { PoolThreshold } from "./pool-threshold.ts"
import { AttributeObj } from "./data.ts"
import { AttributeDef } from "./definition.ts"
import { ActorFlags, SYSTEM_NAME, gid } from "@data"
import { AttributeResolver, ErrorGURPS, attribute, stlimit } from "@util"
import { AbstractAttribute } from "@system/abstract-attribute/object.ts"

class Attribute<TActor extends AttributeResolver> extends AbstractAttribute<TActor> {
	adj = 0
	damage?: number
	order: number
	applyOps: boolean

	private _overridenThreshold: PoolThreshold | null = null

	constructor(actor: TActor, data: AttributeObj, order: number) {
		super(actor, data)
		this.adj = data.adj
		if (data.damage !== undefined) this.damage = data.damage
		this.order = order
		this.applyOps = this.definition?.type === attribute.Type.Pool
	}

	overrideThreshold(value: PoolThreshold): Error | void {
		if (!this.definition) return ErrorGURPS(`Attribute with ID ${this.id} has no definition`)
		if (this.definition.type !== attribute.Type.Pool)
			return ErrorGURPS(`Cannot set threshold for non-pool attribute "${this.definition?.fullName}"`)
		this._overridenThreshold = value
	}

	get bonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None)
	}

	get effectiveBonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None, true)
	}

	get definition(): AttributeDef | null {
		return this.actor.settings.attributes.find(att => att.id === this.id) ?? null
	}

	override get max(): number {
		const def = this.definition
		if (!def) return 0
		const max = super.max + this.adj + this.bonus
		if ([attribute.Type.Decimal, attribute.Type.DecimalRef].includes(this.definition?.type)) return Math.floor(max)
		return max
	}

	override get current(): number {
		if (this.definition && this.definition.type === attribute.Type.Pool) return this.max - (this.damage ?? 0)
		return this.max
	}

	override get effective(): number {
		const def = this.definition
		if (!def) return 0
		const eff = this.max + this.effectiveBonus
		if ([attribute.Type.Decimal, attribute.Type.DecimalRef].includes(this.definition?.type)) return Math.floor(eff)
		if (this.id === gid.Strength) return this.actor.effectiveST(eff)
		return eff
	}

	get points(): number {
		const def = this.definition
		if (!def) return 0
		let sm = 0
		if (this.actor) sm = this.actor.adjustedSizeModifier
		return def.computeCost(this.actor, this.adj, this.costReduction, sm)
	}

	get costReduction(): number {
		if (!this.actor) return 0
		return this.actor.costReductionFor(this.id)
	}

	private _manualThreshold(): PoolThreshold | null {
		if (!this.actor || !this.definition) return null
		return this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].manual[this.id] ?? null
	}

	get currentThreshold(): PoolThreshold | null {
		if (!this.actor || !this.definition) return null
		if (this.definition.type !== attribute.Type.Pool) return null
		if (this._overridenThreshold) return this._overridenThreshold
		if (this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].active === false) return this._manualThreshold()
		for (const threshold of this.definition.thresholds ?? []) {
			if (this.current <= threshold.threshold(this.actor)) return threshold
		}
		return null
	}
}

export { Attribute }
