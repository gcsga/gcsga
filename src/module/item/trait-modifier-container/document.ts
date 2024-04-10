import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitModifierContainerSource, TraitModifierContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"

const fields = foundry.data.fields

class TraitModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.TraitModifierContainer }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.TraitModifierContainer],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				ancestry: new fields.StringField(),
				userdesc: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				open: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	get children(): Collection<
		ItemInstances<TParent>[ItemType.TraitModifier] | ItemInstances<TParent>[ItemType.TraitModifierContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.TraitModifier, ItemType.TraitModifierContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.TraitModifier]
						| ItemInstances<TParent>[ItemType.TraitModifierContainer],
				]),
		)
	}
}

interface TraitModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitModifierContainerSource
	system: TraitModifierContainerSystemData
}

export { TraitModifierContainerGURPS }
