import { LocalizeGURPS } from "@util/localize.ts"
import fields = foundry.data.fields
import { TooltipGURPS, feature } from "@util"
import { gid } from "@module/data/constants.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { StringArrayField } from "../item/fields/string-array-field.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { equalFold } from "../item/compontents/index.ts"

class DRBonus extends BaseFeature<DRBonusSchema> {
	static override TYPE = feature.Type.DRBonus

	static override defineSchema(): DRBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			locations: new StringArrayField({
				required: true,
				nullable: false,
				initial: [gid.Torso],
			}),
			specialization: new fields.StringField({ required: true, nullable: false, initial: gid.All }),
		}
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			this._normalize()
			tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.dr_bonus, {
					// level: this.leveledAmount.format(false),
					level: this.format(false),
					type: this.specialization ?? gid.All,
				}),
			)
		}
	}

	get locationOptions(): { key: string; value: string }[] {
		const settings = SheetSettings.for(this.parent.actor)
		const locations: { key: string; value: string }[] = []
		for (const location of settings.body_type.locations) {
			if (!locations.some(e => e.key === location.id))
				locations.push({ key: location.id, value: location.choice_name })
		}
		return locations.sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0))
	}

	private _normalize(): void {
		for (const [index, location] of this.locations.entries()) {
			const newLocation = location.trim()
			if (equalFold(newLocation, gid.All)) {
				this.locations = [gid.All]
				break
			}
			this.locations[index] = location
		}
		let s = this.specialization?.trim() ?? ""
		if (s === "" || equalFold(s, gid.All)) s = gid.All
		this.specialization = s
	}

	override toFormElement(): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement()

		const options = this.locationOptions

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")

		rowElement1.append(
			foundry.applications.fields.createSelectInput({
				name: `${prefix}.locations`,
				value: this.locations[0] === gid.All ? gid.All : "",
				localize: true,
				options: [
					{
						value: gid.All,
						label: "GURPS.Item.Features.FIELDS.DRBonus.Locations.All",
					},
					{
						value: "",
						label: "GURPS.Item.Features.FIELDS.DRBonus.Locations.Some",
					},
				],
			}),
		)

		element.append(rowElement1)

		if (this.locations[0] !== gid.All) {
			const rowElement2 = document.createElement("div")
			rowElement2.classList.add("form-fields", "secondary", "dr-locations")

			for (const option of options) {
				const label = document.createElement("label")
				label.append(
					foundry.applications.fields.createCheckboxInput({
						name: "",
						dataset: {
							action: "toggleDrBonusLocation",
							index: this.index.toString(),
							location: option.key,
						},
						value: this.locations.includes(option.key),
					}),
				)
				label.innerHTML += option.value
				rowElement2.append(label)
			}

			element.append(rowElement2)
		}

		const labelBefore = document.createElement("label")
		labelBefore.innerHTML = game.i18n.localize("GURPS.Item.Features.FIELDS.DRBonus.SpecializationBefore")
		rowElement3.append(labelBefore)

		rowElement3.append(
			this.schema.fields.specialization.toInput({
				name: `${prefix}.specialization`,
				value: this.specialization,
				localize: true,
			}) as HTMLElement,
		)

		const labelAfter = document.createElement("label")
		labelAfter.innerHTML = game.i18n.localize("GURPS.Item.Features.FIELDS.DRBonus.SpecializationAfter")
		rowElement3.append(labelAfter)

		element.append(rowElement3)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface DRBonus extends BaseFeature<DRBonusSchema>, ModelPropsFromSchema<DRBonusSchema> {}

type DRBonusSchema = BaseFeatureSchema & {
	locations: StringArrayField<true, false, true>
	specialization: fields.StringField<string, string, true, false, true>
}

export { DRBonus, type DRBonusSchema }
