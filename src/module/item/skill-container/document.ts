import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SkillContainerSource, SkillContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"
import { TemplatePicker } from "@system"

const fields = foundry.data.fields

class SkillContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.SkillContainer }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.SkillContainer],
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
		| ItemInstances<TParent>[ItemType.Skill]
		| ItemInstances<TParent>[ItemType.Technique]
		| ItemInstances<TParent>[ItemType.SkillContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.SkillContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.Skill]
						| ItemInstances<TParent>[ItemType.Technique]
						| ItemInstances<TParent>[ItemType.SkillContainer],
				]),
		)
	}
}

interface SkillContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: SkillContainerSource
	system: SkillContainerSystemData
}

export { SkillContainerGURPS }
