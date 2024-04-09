import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SpellContainerSource, SpellContainerSystemData } from "./data.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemInstances } from "@item/types.ts"
import { LocalizeGURPS } from "@util"
import { TemplatePicker } from "@system"

const fields = foundry.data.fields
class SpellContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.SpellContainer }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.SpellContainer],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				ancestry: new fields.StringField(),
				userdesc: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
				open: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	get children(): Collection<
		| ItemInstances<TParent>[ItemType.Spell]
		| ItemInstances<TParent>[ItemType.RitualMagicSpell]
		| ItemInstances<TParent>[ItemType.SpellContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.Spell]
						| ItemInstances<TParent>[ItemType.RitualMagicSpell]
						| ItemInstances<TParent>[ItemType.SpellContainer],
				]),
		)
	}
}

interface SpellContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: SpellContainerSource
	system: SpellContainerSystemData
}

export { SpellContainerGURPS }
