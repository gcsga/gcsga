import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { EquipmentModifierContainerSource, EquipmentModifierContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"

const fields = foundry.data.fields

class EquipmentModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.EquipmentModifierContainer }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentModifierContainer],
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
		ItemInstances<TParent>[ItemType.EquipmentModifier] | ItemInstances<TParent>[ItemType.EquipmentModifierContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.EquipmentModifier]
						| ItemInstances<TParent>[ItemType.EquipmentModifierContainer],
				]),
		)
	}
}

interface EquipmentModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: EquipmentModifierContainerSource
	system: EquipmentModifierContainerSystemData
}

export { EquipmentModifierContainerGURPS }
