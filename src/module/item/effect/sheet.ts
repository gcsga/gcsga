import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { EffectGURPS } from "./document.ts"
import { DurationType } from "./data.ts"
import { ItemType, SYSTEM_NAME } from "@data"

export class EffectSheet<IType extends EffectGURPS = EffectGURPS> extends ItemSheetGURPS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["effect"]),
		})
		return options
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/${ItemType.Effect}/sheet.hbs`
	}

	override get isEditable(): boolean {
		if (this.item.type === ItemType.Condition) return false
		return super.isEditable
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("#modifiers .add").on("click", event => this._addModifier(event))
		html.find(".modifier .remove").on("click", event => this._removeModifier(event))
	}

	protected async _addModifier(event: JQuery.ClickEvent): Promise<IType | undefined> {
		event.preventDefault()
		if (!this.isEditable) return
		const modifiers = this.item.system.modifiers ?? []
		modifiers.push({
			id: "",
			modifier: 0,
			max: 0,
			cost: { value: 0, id: "" },
		})
		return this.item.update({ "system.modifiers": modifiers })
	}

	protected async _removeModifier(event: JQuery.ClickEvent): Promise<IType | undefined> {
		if (!this.isEditable) return
		const index = $(event.currentTarget).data("index")
		const modifiers = this.item.system.modifiers ?? []
		modifiers.splice(index, 1)
		return this.item.update({ "system.modifiers": modifiers })
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = await super.getData(options)
		return fu.mergeObject(data, {
			duration:
				this.item.system.duration.type !== DurationType.None
					? this.item.system.duration[this.item.system.duration.type]
					: 0,
		})
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		formData["system.duration.seconds"] = 0
		formData["system.duration.turns"] = 0
		formData["system.duration.rounds"] = 0
		if (formData.duration) {
			const type = formData["system.duration.type"] as DurationType
			if (type !== DurationType.None) formData[`system.duration.${type}`] = formData.duration
			delete formData.duration
		}
		return super._updateObject(event, formData)
	}
}
