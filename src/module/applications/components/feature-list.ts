import { ItemTemplateType } from "@module/data/item/types.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ErrorGURPS, feature, htmlClosest } from "@util"
import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import { ItemSheetGURPS } from "../item/item-sheet.ts"
import { ActiveEffectSheetGURPS } from "../active-effect/active-effect-sheet.ts"
import { ItemTemplateInst } from "@module/data/item/helpers.ts"
import { EffectTemplateInst } from "@module/data/active-effect/helpers.ts"
import { AttributeBonus } from "@module/data/feature/attribute-bonus.ts"
import { FeatureTypes } from "@module/data/feature/types.ts"

class FeatureListElement extends HTMLElement {
	connectedCallback(): void {
		const app = foundry.applications.instances.get(htmlClosest(this, ".application")?.id ?? "")
		if (app instanceof ItemSheetGURPS || app instanceof ActiveEffectSheetGURPS) this.#app = app
		else {
			throw ErrorGURPS("Application holding Feature list element is not an Item Sheet or Active Effect sheet")
		}

		this.querySelector("button[data-add-feature]")?.addEventListener("click", this._onAddFeature.bind(this))
		for (const button of this.querySelectorAll("button[data-delete-feature]")) {
			button.addEventListener("click", this._onDeleteFeature.bind(this))
		}

		for (const input of this.querySelectorAll("[data-selector='feature-type'")) {
			input.addEventListener("change", event => this._onChangeFeatureType(event))
		}
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	#app!: ItemSheetGURPS | ActiveEffectSheetGURPS

	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	protected get _app(): ItemSheetGURPS | ActiveEffectSheetGURPS {
		return this.#app
	}

	/* -------------------------------------------- */

	/**
	 * Containing actor for this inventory, either the document or its parent if document is an item.
	 */
	get actor(): ActorGURPS2 | null {
		if (this.document instanceof Item) return this.document.parent ?? null
		if (this.document instanceof ActiveEffect) {
			if (this.document.parent instanceof Actor) return this.document.parent
			return this.document.parent.parent ?? null
		}
		return null
	}

	/* -------------------------------------------- */

	/**
	 * Document whose inventory is represented.
	 */
	get document(): ItemGURPS2 | ActiveEffectGURPS {
		return this._app.document
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	documentCanAcceptFeatures(
		document: ItemGURPS2 | ActiveEffectGURPS,
	): document is ItemTemplateInst<ItemTemplateType.Feature> | EffectTemplateInst<ItemTemplateType.Feature> {
		return document.hasTemplate(ItemTemplateType.Feature)
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	protected async _onAddFeature(event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const doc = this.document
		if (!this.documentCanAcceptFeatures(doc)) return

		const features = doc.system.toObject().features
		features.push(new AttributeBonus({}).toObject())

		await this.document.update({ "system.features": features })
	}

	/* -------------------------------------------- */

	protected async _onDeleteFeature(event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const doc = this.document
		if (!this.documentCanAcceptFeatures(doc)) return

		const features = doc.system.toObject().features
		features.splice(index, 1)

		await this.document.update({ "system.features": features })
	}

	/* -------------------------------------------- */

	protected async _onChangeFeatureType(event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLSelectElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const value = element.value as feature.Type
		const doc = this.document
		if (!this.documentCanAcceptFeatures(doc)) return

		const features = doc.system.toObject().features

		features.splice(index, 1, new FeatureTypes[value]({ type: value }).toObject())

		this.document.update({ "system.features": features })
	}
}

export { FeatureListElement }
