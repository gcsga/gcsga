import { PoolThreshold } from "./pool-threshold.ts"
import { TokenPool, gid } from "@data"
import { ErrorGURPS, Int, attribute, stlimit } from "@util"
import { AbstractAttribute } from "@system/abstract-attribute/object.ts"
import { AttributeSchema } from "./data.ts"
import { AttributeDef } from "./definition.ts"
import { AbstractAttributeConstructionOptions } from "@system/abstract-attribute/data.ts"
import { SheetSettings } from "@system/sheet-settings.ts"
import { Mook } from "@system/mook/index.ts"
import { ActorDataModel } from "@module/data/abstract.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { AttributeHolderTemplate } from "@module/data/actor/templates/attribute-holder.ts"

// class AttributeGURPS extends AbstractAttribute<CharacterGURPS | Mook, AttributeSchema> {
class AttributeGURPS<
	TActor extends AttributeHolderTemplate | Mook = AttributeHolderTemplate | Mook,
> extends AbstractAttribute<TActor, AttributeSchema> {
	order: number

	// protected _overridenThreshold: PoolThreshold | null = null

	constructor(
		data: DeepPartial<SourceFromSchema<AttributeSchema>>,
		// options?: AbstractAttributeConstructionOptions<CharacterGURPS | Mook>,
		options?: AbstractAttributeConstructionOptions<TActor>,
	) {
		super(data, options)
		this.order = options?.order ?? 0
	}

	static override defineSchema(): AttributeSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			adj: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			damage: new fields.NumberField({ required: true, nullable: true, initial: null }),
			applyOps: new fields.BooleanField({ required: true, nullable: true, initial: null }),
			manualThreshold: new fields.NumberField({ required: true, nullable: true, initial: null }),
		}
	}

	// overrideThreshold(value: PoolThreshold): Error | void {
	// 	if (this.definition?.type !== attribute.Type.Pool)
	// 		return ErrorGURPS(`Cannot set threshold for non-pool attribute "${this.definition?.fullName}"`)
	// 	this._overridenThreshold = value
	// }

	get bonus(): number {
		if (this.actor instanceof ActorDataModel && !this.actor.hasTemplate(ActorTemplateType.Features)) {
			console.warn(
				`Actor "${this.actor.parent.name}" of type "${this.actor.parent.type}" is not compatible with attribute bonuses.`,
			)
			return 0
		}
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None)
	}

	get temporaryBonus(): number {
		if (this.actor instanceof ActorDataModel && !this.actor.hasTemplate(ActorTemplateType.Features)) {
			console.warn(
				`Actor "${this.actor.parent.name}" of type "${this.actor.parent.type}" is not compatible with attribute bonuses.`,
			)
			return 0
		}
		return this.actor.attributeBonusFor(this.id, stlimit.Option.None, null, true)
	}

	get definition(): AttributeDef<TActor> {
		const definition = SheetSettings.for(this.actor.parent).attributes.find(att => att.id === this.id)
		if (!definition) {
			throw ErrorGURPS(`Attribute with ID ${this.id} has no definition`)
		}
		return new AttributeDef(definition)
	}

	override get max(): number {
		const def = this.definition
		if (!def) return 0
		const max = super.max + this.adj + this.bonus
		if (![attribute.Type.Decimal, attribute.Type.DecimalRef].includes(this.definition?.type)) return Math.floor(max)
		return max
	}

	override get current(): number {
		if (this.definition && this.definition.type === attribute.Type.Pool) return this.max - (this.damage ?? 0)
		return this.max
	}

	override get temporaryMax(): number {
		const def = this.definition
		if (!def) return 0
		const eff = this.max + this.temporaryBonus
		if (![attribute.Type.Decimal, attribute.Type.DecimalRef].includes(this.definition?.type)) return Math.floor(eff)
		if (this.id === gid.Strength) return this.actor.temporaryST(eff)
		return eff
	}

	get points(): number {
		const def = this.definition
		if (!def) return 0
		let sm = 0
		if (this.actor instanceof Mook || this.actor?.hasTemplate(ActorTemplateType.Features))
			sm = this.actor.adjustedSizeModifier
		return def.computeCost(this.actor, this.adj, this.costReduction, sm)
	}

	get costReduction(): number {
		if (this.actor instanceof ActorDataModel && !this.actor.hasTemplate(ActorTemplateType.Features)) {
			console.warn(
				`Actor "${this.actor.parent.name}" of type "${this.actor.parent.type}" is not compatible with attribute bonuses.`,
			)
			return 0
		}
		return this.actor.costReductionFor(this.id)
	}

	// private get _manualThreshold(): PoolThreshold | null {
	// 	if (!this.actor || !this.definition) return null
	// 	return this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].manual[this.id] ?? null
	// }

	get currentThreshold(): PoolThreshold | null {
		if (!this.actor) {
			console.error(`No actor found for attribute "${this.id}`)
			return null
		}
		if (!this.definition) {
			console.error(`No definition found for attribute "${this.id}`)
			return null
		}
		if (!this.definition.thresholds) {
			console.error(`No thresholds found for attribute "${this.id}`)
			return null
		}

		if (this.manualThreshold !== null) return this.definition.thresholds[this.manualThreshold]

		for (const threshold of this.definition.thresholds ?? []) {
			if (this.current <= threshold.threshold(this.actor)) return threshold
		}
		return null

		// if (!this.actor || !this.definition) return null
		// if (this.definition.type !== attribute.Type.Pool) return null
		// // if (this._overridenThreshold) return this._overridenThreshold
		// if (this.manualThreshold !== null) return this.definition.thresholds[this.manualThreshold]
		// // if (this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold].active === false) return this._manualThreshold
		// for (const threshold of this.definition.thresholds ?? []) {
		// 	if (this.current <= threshold.threshold(this.actor)) return threshold
		// }
		// return null
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

// interface AttributeGURPS
// 	extends AbstractAttribute<CharacterGURPS | Mook, AttributeSchema>,
// 		ModelPropsFromSchema<AttributeSchema> {}
interface AttributeGURPS<TActor extends AttributeHolderTemplate | Mook>
	extends AbstractAttribute<TActor, AttributeSchema>,
		ModelPropsFromSchema<AttributeSchema> {}

export { AttributeGURPS }
