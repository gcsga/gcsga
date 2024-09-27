import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS, StringComparison, TooltipGURPS } from "@util"
import { ActorType } from "@module/data/constants.ts"
import { ActorInst } from "../actor/helpers.ts"
import { Nameable } from "@module/util/index.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { createButton } from "@module/applications/helpers.ts"

class EquippedEquipmentPrereq extends BasePrereq<EquippedEquipmentPrereqSchema> {
	static override TYPE = prereq.Type.EquippedEquipment

	static override defineSchema(): EquippedEquipmentPrereqSchema {
		return {
			...super.defineSchema(),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.EquippedEquipment.Name"),
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
			}),
			tags: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoicesPlural(
					"GURPS.Item.Prereqs.FIELDS.EquippedEquipment.TagsSingle",
					"GURPS.Item.Prereqs.FIELDS.EquippedEquipment.TagsPlural",
				),
				initial: { compare: StringComparison.Option.AnyString, qualifier: "" },
			}),
		}
	}

	satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		let replacements: Map<string, string> = new Map()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let satisfied = false
		for (const eqp of actor.itemCollections.equipment) {
			satisfied =
				exclude !== eqp &&
				eqp.system.equipped &&
				eqp.system.quantity > 0 &&
				this.name.matches(replacements, eqp.system.nameWithReplacements) &&
				this.tags.matchesList(replacements, ...eqp.system.tags)
			if (satisfied) break
		}
		if (!satisfied) {
			hasEquipmentPenalty.value = true
			if (tooltip !== null) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.Base, {
						prefix: LocalizeGURPS.translations.GURPS.Tooltip.Prefix,
						name: this.name.toString(replacements),
						tags: this.tags.toStringWithPrefix(
							replacements,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.OneTag,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.AllTags,
						),
					}),
				)
			}
		}
		return satisfied
	}

	override toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.prereqs.${this.index}`
		// Root element
		element.classList.add("prereq")

		const idInput = this.schema.fields.id.toInput({
			name: `${prefix}.id`,
			value: this.id,
			readonly: true,
		}) as HTMLElement
		idInput.style.setProperty("display", "none")

		element.append(idInput)

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields")

		rowElement1.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deletePrereq",
					id: this.id,
				},
			}),
		)

		const typeField = this.schema.fields.type
		;(typeField as any).choices = prereq.TypesWithoutListChoices
		rowElement1.append(
			typeField.toInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					index: this.index.toString(),
					action: "changePrereqType",
				},
				localize: true,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Name
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields")
		rowElement2.append(
			this.schema.fields.name.fields.compare.toInput({
				name: `${prefix}.name.compare`,
				value: this.name.compare,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: `${prefix}.name.qualifier`,
				value: this.name.qualifier,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		// Tags
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields")
		rowElement3.append(
			this.schema.fields.tags.fields.compare.toInput({
				name: `${prefix}.tags.compare`,
				value: this.tags.compare,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.tags.fields.qualifier.toInput({
				name: `${prefix}.tags.qualifier`,
				value: this.tags.qualifier.toString(),
			}) as HTMLElement,
		)
		element.append(rowElement3)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface EquippedEquipmentPrereq
	extends BasePrereq<EquippedEquipmentPrereqSchema>,
		ModelPropsFromSchema<EquippedEquipmentPrereqSchema> {}

type EquippedEquipmentPrereqSchema = BasePrereqSchema & {
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { EquippedEquipmentPrereq, type EquippedEquipmentPrereqSchema }
