import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { TraitModifierSource, TraitModifierSystemData } from "./data.ts"
import { LocalizeGURPS, StringBuilder, affects, display, tmcost } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { ItemType } from "@module/data/constants.ts"
import { Feature } from "@system"

const fields = foundry.data.fields

class TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.TraitModifier }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.TraitModifier],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				userdesc: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				cost: new fields.NumberField({ initial: 0 }),
				levels: new fields.NumberField({ min: 0 }),
				affects: new fields.StringField<affects.Option>({
					choices: affects.Options,
					initial: affects.Option.Total,
				}),
				cost_type: new fields.StringField<tmcost.Type>({
					choices: tmcost.Types,
					initial: tmcost.Type.Percentage,
				}),
				disabled: new fields.BooleanField({ initial: false }),
				features: new fields.ArrayField(new fields.ObjectField<Feature>()),
			}),
		})
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(sheetSettingsFor(this.actor).notes_display)) return this.localNotes
		return ""
	}

	get levels(): number {
		return this.system.levels
	}

	get costDescription(): string {
		let base = ""
		if (this.costType === tmcost.Type.Percentage) {
			if (this.isLeveled) {
				base = (this.cost * this.levels).signedString()
			} else {
				base = this.cost.signedString()
			}
			base += "%"
		} else if (this.costType === tmcost.Type.Points) base = this.cost.signedString()
		else if (this.costType === tmcost.Type.Multiplier) return `×${this.cost}`
		return base
	}

	get enabled(): boolean {
		return !this.system.disabled
	}

	get costType(): tmcost.Type {
		return this.system.cost_type
	}

	get affects(): affects.Option {
		return this.system.affects
	}

	get cost(): number {
		return this.system.cost
	}

	get costModifier(): number {
		if (this.levels > 0) return this.cost * this.levels
		return this.cost
	}

	get fullDescription(): string {
		const buffer = new StringBuilder()
		buffer.push(this.formattedName)
		if (this.localNotes !== "") buffer.push(` (${this.localNotes})`)
		if (sheetSettingsFor(this.actor).show_trait_modifier_adj) buffer.push(` [${this.costDescription}]`)
		return buffer.toString()
	}

	get isLeveled(): boolean {
		return this.costType === tmcost.Type.Percentage && this.levels > 0
	}
}

interface TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: TraitModifierSource
	system: TraitModifierSystemData
}

export { TraitModifierGURPS }
