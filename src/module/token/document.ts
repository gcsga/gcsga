import { BaseActorGURPS, CharacterGURPS } from "@actor"
import { ConditionID } from "@item/condition"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { TokenDataProperties } from "types/foundry/common/data/data.mjs/tokenData"
import { PropertiesToSource } from "types/types/helperTypes"

export class TokenDocumentGURPS extends TokenDocument {
	sort!: number

	overlayEffect: any

	get actor(): BaseActorGURPS | null {
		return super.actor as BaseActorGURPS | null
	}

	protected _onCreate(data: PropertiesToSource<TokenDataProperties>, options: DocumentModificationOptions, userId: string): void {
		super._onCreate(data, options, userId)
		this.actor?.prepareData()
	}

	hasStatusEffect(statusId: ConditionID): boolean {
		if (statusId === ConditionID.Dead) return this.overlayEffect === CONFIG.controlIcons.defeated
		const { actor } = this
		const hasCondition = (actor as BaseActorGURPS<any>)?.hasCondition(statusId) || false
		const hasEffect = (actor as BaseActorGURPS<any>)?.gEffects.some(e => e.name === statusId)
		return hasCondition || hasEffect
	}

	getBarAttribute(barName: string, { alternative }: any = {}): any {
		const attr = alternative || (this as any)[barName]?.attribute
		if (!attr || !this.actor) return null
		let data = foundry.utils.getProperty((this.actor as any).system, attr)
		if (data === null || data === undefined) return null
		const model = game.model.Actor[this.actor.type]

		// Single values
		if (Number.isNumeric(data)) {
			return {
				type: "value",
				attribute: attr,
				value: Number(data),
				editable: foundry.utils.hasProperty(model, attr),
			}
		}

		// Attribute objects
		else if ("value" in data && "max" in data) {
			if (this.actor instanceof CharacterGURPS)
				return {
					type: "bar",
					attribute: attr,
					value: parseInt(data.value || 0),
					max: parseInt(data.max || 0),
					editable: true,
				}
			return {
				type: "bar",
				attribute: attr,
				value: parseInt(data.value || 0),
				max: parseInt(data.max || 0),
				editable: foundry.utils.hasProperty(model, `${attr}.value`),
			}
		}

		// Otherwise null
		return null
	}
}
