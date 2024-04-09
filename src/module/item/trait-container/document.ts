import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitContainerSource, TraitContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS, container, selfctrl } from "@util"
import { calculateModifierPoints } from "@item/helpers.ts"
import { TemplatePicker } from "@system"

const fields = foundry.data.fields

class TraitContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.TraitContainer }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.TraitContainer],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				ancestry: new fields.StringField(),
				userdesc: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
				cr: new fields.NumberField<selfctrl.Roll>({ choices: selfctrl.Rolls, initial: selfctrl.Roll.NoCR }),
				cr_adj: new fields.StringField<selfctrl.Adjustment>({
					choices: selfctrl.Adjustments,
					initial: selfctrl.Adjustment.NoCRAdj,
				}),
				container_type: new fields.StringField<container.Type>({ choices: container.Types }),
				disabled: new fields.BooleanField({ initial: false }),
				open: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	get CR(): selfctrl.Roll {
		return this.system.cr
	}

	get CRAdj(): selfctrl.Adjustment {
		return this.system.cr_adj
	}

	get modifiers(): Collection<
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

	get deepModifiers(): Collection<ItemInstances<TParent>[ItemType.TraitModifier]> {
		return new Collection(
			this.modifiers
				.reduce((acc: ItemInstances<TParent>[ItemType.TraitModifier][], mod) => {
					if (mod.isOfType(ItemType.TraitModifier)) acc.push(mod)
					else
						acc.push(
							...(mod.deepContents.filter(content =>
								content.isOfType(ItemType.TraitModifier),
							) as ItemInstances<TParent>[ItemType.TraitModifier][]),
						)
					return acc
				}, [])
				.map(item => [item.id, item]),
		)
	}

	get allModifiers(): Collection<ItemInstances<TParent>[ItemType.TraitModifier]> {
		return new Collection(
			[
				...this.deepModifiers,
				...((this.container?.isOfType(ItemType.TraitContainer)
					? this.container.deepModifiers
					: []) as ItemInstances<TParent>[ItemType.TraitModifier][]),
			].map(item => [item.id, item]),
		)
	}

	get children(): Collection<
		ItemInstances<TParent>[ItemType.Trait] | ItemInstances<TParent>[ItemType.TraitContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Trait, ItemType.TraitContainer))
				.map(item => [
					item.id,
					item as ItemInstances<TParent>[ItemType.Trait] | ItemInstances<TParent>[ItemType.TraitContainer],
				]),
		)
	}

	get containerType(): container.Type {
		return this.system.container_type
	}

	get adjustedPoints(): number {
		if (!this.enabled) return 0
		let points = 0
		if (this.containerType === container.Type.AlternativeAbilities) {
			const values = this.children.map(child => child.adjustedPoints)
			points = Math.max(...values)
			const maximum = points
			let found = false
			for (const v of values) {
				if (!found && maximum === v) found = true
				else points += Math.ceil(calculateModifierPoints(v, 20))
			}
		} else {
			points = this.children.reduce((acc, child) => {
				return (acc += child.adjustedPoints)
			}, 0)
		}
		return points
	}
}

interface TraitContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitContainerSource
	system: TraitContainerSystemData
}

export { TraitContainerGURPS }
