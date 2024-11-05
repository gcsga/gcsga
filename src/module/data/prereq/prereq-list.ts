import { ActorType } from "@module/data/constants.ts"
import fields = foundry.data.fields
import { NumericComparison, TooltipGURPS, extractTechLevel } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq } from "./index.ts"
import { PrereqTemplate } from "@module/data/item/templates/prereqs.ts"
import { ActorInst } from "../actor/helpers.ts"
import { BasePrereqSchema } from "./base-prereq.ts"
import { Prereq } from "./types.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringArrayField } from "../item/fields/string-array-field.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"

class PrereqList extends BasePrereq<PrereqListSchema> {
	static override TYPE = prereq.Type.List

	static override defineSchema(): PrereqListSchema {
		return {
			...super.defineSchema(),
			all: new BooleanSelectField({
				required: true,
				nullable: false,
				choices: {
					true: "GURPS.Item.Prereqs.FIELDS.All.Choices.true",
					false: "GURPS.Item.Prereqs.FIELDS.All.Choices.false",
				},
				initial: true,
			}),
			when_tl: new NumericCriteriaField({
				choices: NumericComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.WhenTL"),
			}),
			prereqs: new StringArrayField({ required: true, nullable: false, initial: [] }),
		}
	}

	get children(): Prereq[] {
		const children: Prereq[] = []
		for (const id of this.prereqs) {
			const child = (this.parent as unknown as PrereqTemplate).prereqs.find(e => e.id === id)
			if (child) children.push(child)
		}
		return children
	}

	get allChildren(): string[] {
		const prereqs = this.prereqs
		for (const child of this.children) {
			if (child.isOfType(prereq.Type.List)) prereqs.push(...child.allChildren)
		}
		return prereqs
	}

	satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		hasEquipmentPenalty: { value: boolean } = { value: false },
	): boolean {
		if (this.when_tl.compare !== NumericComparison.Option.AnyNumber) {
			let tl = extractTechLevel(actor.system.profile.tech_level)
			if (tl < 0) tl = 0
			if (!this.when_tl.matches(tl)) return true
		}
		let count = 0
		let local: TooltipGURPS | null = null
		if (tooltip !== null) local = new TooltipGURPS()
		const eqpPenalty = false
		for (const one of this.children) {
			if (one.satisfied(actor, exclude, local, hasEquipmentPenalty)) count += 1
		}
		const satisfied = count === this.prereqs.length || (!this.all && count > 0)
		if (!satisfied) {
			if (eqpPenalty) hasEquipmentPenalty.value = eqpPenalty
			if (tooltip !== null && local !== null) {
				tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
				if (this.all) tooltip.push(game.i18n.localize("GURPS.Prereq.List.All"))
				else tooltip.push(game.i18n.localize("GURPS.Prereq.List.NotAll"))
				tooltip.push(local)
			}
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.prereqs.${this.index}`
		// Root element
		element.classList.add("prereq")

		element.append(createDummyElement(`${prefix}.id`, this.id))
		element.append(createDummyElement(`${prefix}.type`, this.type))
		element.append(createDummyElement(`${prefix}.prereqs`, this.prereqs.join(",")))

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		// Buttons
		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-plus"],
				label: "",
				data: {
					action: "addPrereq",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)
		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-ellipsis-vertical"],
				label: "",
				data: {
					action: "addPrereqList",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)
		if (this.id !== "root") {
			rowElement.append(
				createButton({
					icon: ["fa-regular", "fa-trash"],
					label: "",
					data: {
						action: "deletePrereq",
						id: this.id,
					},
					disabled: !enabled,
				}),
			)
		}

		// When TL
		rowElement.append(
			this.schema.fields.when_tl.fields.compare.toInput({
				name: enabled ? `${prefix}.when_tl.compare` : "",
				value: this.when_tl.compare,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement.append(
			this.schema.fields.when_tl.fields.qualifier.toInput({
				name: enabled ? `${prefix}.when_tl.qualifier` : "",
				value: this.when_tl.qualifier?.toString(),
				disabled: !enabled || this.when_tl.compare === NumericComparison.Option.AnyNumber,
			}) as HTMLElement,
		)

		// All
		rowElement.append(
			this.schema.fields.all.toInput({
				name: enabled ? `${prefix}.all` : "",
				value: this.all.toString(),
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		element.append(rowElement)

		// Child Prereqs
		const listElement = document.createElement("ul")
		this.children.forEach((child, index) => {
			if (index !== 0) {
				const hr = document.createElement("hr")
				listElement.append(hr)
			}
			listElement.append(child.toFormElement(enabled))
		})
		// listElement.append(...this.children.map(e => e.toFormElement()))
		element.append(listElement)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		for (const prereq of this.children) {
			prereq.fillWithNameableKeys(m, existing)
		}
	}
}

interface PrereqList extends BasePrereq<PrereqListSchema>, ModelPropsFromSchema<PrereqListSchema> {}

export type PrereqListSchema = BasePrereqSchema & {
	all: fields.BooleanField<boolean, boolean, true, false, true>
	when_tl: NumericCriteriaField<true, false, true>
	prereqs: StringArrayField<true, false, true>
}

export { PrereqList }
