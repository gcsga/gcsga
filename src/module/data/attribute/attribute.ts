import { AttributeHolderTemplate } from "../actor/templates/attribute-holder.ts"
import fields = foundry.data.fields
import {
	AbstractAttribute,
	AbstractAttributeConstructionOptions,
	AbstractAttributeSchema,
} from "../abstract-attribute/abstract-attribute.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { ActorDataModel } from "../abstract.ts"
import { ErrorGURPS, Int, attribute, stlimit, threshold } from "@util"
import { AttributeDef } from "./attribute-definition.ts"
import { gid } from "../constants.ts"
import { PoolThreshold } from "./pool-threshold.ts"
import { TokenPool } from "../types.ts"

class AttributeGURPS<TActor extends AttributeHolderTemplate = AttributeHolderTemplate> extends AbstractAttribute<
	TActor,
	AttributeSchema
> {
	order: number

	constructor(
		data: DeepPartial<SourceFromSchema<AttributeSchema>>,
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
		return definition as AttributeDef<TActor>
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
		if (this.actor?.hasTemplate(ActorTemplateType.Features)) sm = this.actor.system.adjustedSizeModifier
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

	static isThresholdOpMet(op: threshold.Op, attributes: AttributeGURPS[]): boolean {
		for (const att of attributes) {
			const t = att.currentThreshold
			if (t !== null && t.ops.includes(op)) return true
		}
		return false
	}
}

interface AttributeGURPS<TActor extends AttributeHolderTemplate>
	extends AbstractAttribute<TActor, AttributeSchema>,
		ModelPropsFromSchema<AttributeSchema> {}

type AttributeSchema = AbstractAttributeSchema & {
	adj: fields.NumberField<number, number, true, false, true>
	damage: fields.NumberField<number, number, true, true, true>
	applyOps: fields.BooleanField<boolean, boolean, true, true, true>
	manualThreshold: fields.NumberField<number, number, true, true, true>
}

export { AttributeGURPS, type AttributeSchema }
