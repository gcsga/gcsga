import { PoolThreshold } from "./pool-threshold.ts"
import { ActorFlags, SYSTEM_NAME, TokenPool, gid } from "@data"
import { ErrorGURPS, Int, attribute, stlimit } from "@util"
import { AbstractAttribute } from "@system/abstract-attribute/object.ts"
import { AttributeSchema } from "./data.ts"
import { CharacterGURPS } from "@actor"
import { AttributeDef } from "./definition.ts"
import { AbstractAttributeConstructionOptions } from "@system/abstract-attribute/data.ts"
import { SheetSettings } from "@system/sheet-settings.ts"

class AttributeGURPS extends AbstractAttribute<CharacterGURPS, AttributeSchema> {
	// adj = 0
	// damage?: number
	order: number
	// applyOps: boolean

	protected _overridenThreshold: PoolThreshold | null = null

	constructor(
		data: DeepPartial<SourceFromSchema<AttributeSchema>>,
		options?: AbstractAttributeConstructionOptions<CharacterGURPS>
	) {
		super(data, options)
		// this.adj = data.adj
		// if (data.damage !== undefined) this.damage = data.damage
		this.order = options?.order ?? 0
		// this.applyOps = this.definition?.type === attribute.Type.Pool
	}

	static override defineSchema(): AttributeSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			adj: new fields.NumberField({ initial: 0 }),
			damage: new fields.NumberField({ nullable: true, initial: null }),
			apply_ops: new fields.BooleanField({ nullable: true, initial: null })
		}
	}

	overrideThreshold(value: PoolThreshold): Error | void {
		if (this.definition?.type !== attribute.Type.Pool)
			return ErrorGURPS(`Cannot set threshold for non-pool attribute "${this.definition?.fullName}"`)
		this._overridenThreshold = value
	}

	get bonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None, false)
	}

	get effectiveBonus(): number {
		if (!this.actor) return 0
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None, true)
	}

	get definition(): AttributeDef | null {
		const definition = SheetSettings.for(this.actor).attributes.find(att => att.id === this.id)
		if (!definition) {
			ErrorGURPS(`Attribute with ID ${this.id} has no definition`)
			return null
		}
		return new AttributeDef(definition)
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

	private get _manualThreshold(): PoolThreshold | null {
		if (!this.actor || !this.definition) return null
		return this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].manual[this.id] ?? null
	}

	get currentThreshold(): PoolThreshold | null {
		if (!this.actor || !this.definition) return null
		if (this.definition.type !== attribute.Type.Pool) return null
		if (this._overridenThreshold) return this._overridenThreshold
		if (this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].active === false) return this._manualThreshold
		for (const threshold of this.definition.thresholds ?? []) {
			if (this.current <= threshold.threshold(this.actor)) return threshold
		}
		return null
	}

	get isSeparator(): boolean {
		if (!this.definition) return false
		return [
			attribute.Type.PrimarySeparator,
			attribute.Type.SecondarySeparator,
			attribute.Type.PoolSeparator,
		].includes(this.definition.type)
	}

	get isPool(): boolean {
		if (!this.definition) return false
		return [attribute.Type.Pool, attribute.Type.PoolSeparator].includes(this.definition.type)
	}

	get isPrimary(): boolean {
		if (!this.definition) return false
		if (this.definition.type === attribute.Type.PrimarySeparator) return true
		if (this.definition.type === attribute.Type.Pool || this.isSeparator) return false
		const [, err] = Int.fromString(this.definition.base.trim())
		return err === null
	}

	get isSecondary(): boolean {
		if (!this.definition) return false
		if (this.definition.type === attribute.Type.SecondarySeparator) return true
		if (this.definition.type === attribute.Type.Pool || this.isSeparator) return false
		const [, err] = Int.fromString(this.definition.base.trim())
		return err !== null
	}

	toTokenPool(): TokenPool | null {
		if (!this.isPool) return null
		return {
			value: this.current,
			max: this.max,
			min: Number.MIN_SAFE_INTEGER,
		}
	}
}

interface AttributeGURPS extends AbstractAttribute<CharacterGURPS, AttributeSchema>, ModelPropsFromSchema<AttributeSchema> { }

export { AttributeGURPS }
