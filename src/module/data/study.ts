import { LocalizeGURPS, study } from "@util"
import fields = foundry.data.fields
import { StudyTemplate } from "@module/data/item/templates/study.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ItemTemplateType } from "./item/types.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"

class Study<TParent extends StudyTemplate = StudyTemplate> extends foundry.abstract.DataModel<TParent, StudySchema> {
	static override defineSchema(): StudySchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({ required: true, nullable: false, choices: study.TypesChoices }),
			hours: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
			note: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}

	static progressText(hours: number, needed: study.Level, force: boolean): string {
		if (hours <= 0) {
			hours = 0
			if (!force) return ""
		}
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied_alt, {
			hours,
			total: needed,
		})
	}

	static resolveHours<TParent extends StudyTemplate>(parent: TParent): number {
		let total = 0
		for (const entry of parent.study) {
			total += entry.hours * study.Type.multiplier(entry.type)
		}
		return total
	}

	get item(): ItemGURPS2 {
		return this.parent.parent
	}

	get index(): number {
		if (!this.parent.hasTemplate(ItemTemplateType.Study)) return -1
		return this.parent.study.indexOf(this)
	}

	get element(): Handlebars.SafeString {
		const enabled: boolean = (this.item.sheet as any).editable
		return new Handlebars.SafeString(this.toFormElement(enabled).outerHTML)
	}

	toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.defaults.${this.index}`

		const element = document.createElement("li")

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.hours`, this.hours))
			element.append(createDummyElement(`${prefix}.note`, this.note))
		}

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteStudyEntry",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)

		rowElement.append(
			this.schema.fields.type.toInput({
				name: enabled ? `${prefix}.type` : "",
				value: this.type,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		const tooltipElement = document.createElement("i")
		tooltipElement.classList.add("fa-solid", "fa-circle-info")
		tooltipElement.dataset.tooltip = study.Type.info(this.type)
		rowElement.append(tooltipElement)

		rowElement.append(
			this.schema.fields.hours.toInput({
				name: enabled ? `${prefix}.hours` : "",
				value: `${this.hours}`,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		rowElement.append(
			foundry.applications.fields.createTextInput({
				name: "",
				value: `${this.hours * study.Type.multiplier(this.type)}`,
				readonly: true,
			}),
		)

		rowElement.append(
			this.schema.fields.note.toInput({
				name: enabled ? `${prefix}.note` : "",
				value: this.note,
				localize: true,
				disabled: !enabled,
				placeholder: game.i18n.localize("GURPS.Item.Study.FIELDS.Note"),
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}
}

interface Study<TParent extends StudyTemplate>
	extends foundry.abstract.DataModel<TParent, StudySchema>,
		ModelPropsFromSchema<StudySchema> {}

type StudySchema = {
	type: fields.StringField<study.Type, study.Type, true, false, true>
	hours: fields.NumberField<number, number, true, false, true>
	note: fields.StringField<string, string, true, false, true>
}

export { Study, type StudySchema }
