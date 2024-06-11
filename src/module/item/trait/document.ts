import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitSource, TraitSystemData } from "./data.ts"
import { LocalizeGURPS, StringBuilder, affects, display, selfctrl, study, tmcost } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { Feature, PrereqList, Study, resolveStudyHours, studyHoursProgressText } from "@system"
import { ItemType } from "@module/data/constants.ts"
import { ItemInstances } from "@item/types.ts"
import { modifyPoints } from "@item/helpers.ts"

const fields = foundry.data.fields

class TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Trait }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Trait],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				userdesc: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				base_points: new fields.NumberField({ integer: true, initial: 0 }),
				levels: new fields.NumberField({ min: 0, nullable: true }),
				points_per_level: new fields.NumberField({ integer: true, nullable: true }),
				prereqs: new fields.SchemaField(PrereqList.defineSchema()),
				features: new fields.ArrayField(new fields.ObjectField<Feature>()),
				study: new fields.ArrayField(new fields.ObjectField<Study>()),
				cr: new fields.NumberField<selfctrl.Roll>({ choices: selfctrl.Rolls, initial: selfctrl.Roll.NoCR }),
				cr_adj: new fields.StringField<selfctrl.Adjustment>({
					choices: selfctrl.Adjustments,
					initial: selfctrl.Adjustment.NoCRAdj,
				}),
				study_hours_needed: new fields.StringField<study.Level>({
					choices: study.Levels,
					initial: study.Level.Standard,
				}),
				disabled: new fields.BooleanField({ initial: false }),
				round_down: new fields.BooleanField({ initial: false }),
				can_level: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	override get formattedName(): string {
		const name: string = this.name ?? ""
		const levels = this.levels
		return `${name}${levels ? ` ${levels}` : ""}`
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor)
		if (this.system.userdesc !== "" && optionChecker(settings.user_description_display)) {
			buffer.push(this.system.userdesc)
		}
		if (optionChecker(settings.modifiers_display)) buffer.appendToNewLine(this.modifierNotes)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false),
			)
		}
		return buffer.toString()
	}

	override get enabled(): boolean {
		if (this.system.disabled) return false
		let enabled = !this.system.disabled
		if (this.container?.isOfType(ItemType.TraitContainer)) enabled = enabled && this.container.enabled
		return enabled
	}

	override set enabled(enabled: boolean) {
		this.system.disabled = !enabled
	}

	get isLeveled(): boolean {
		return this.system.can_level
	}

	get levels(): number {
		return this.system.levels ?? 0
	}

	get basePoints(): number {
		return this.system.base_points ?? 0
	}

	get pointsPerLevel(): number {
		return this.system.points_per_level ?? 0
	}

	get adjustedPoints(): number {
		if (!this.enabled) return 0
		const levels = this.isLeveled ? this.levels : 0
		let basePoints = this.basePoints
		let pointsPerLevel = this.isLeveled ? this.pointsPerLevel : 0
		let [baseEnh, levelEnh, baseLim, levelLim] = [0, 0, 0, 0]
		let multiplier = selfctrl.Roll.multiplier(this.CR)

		this.allModifiers.forEach(mod => {
			const modifier = mod.costModifier
			switch (mod.costType) {
				case tmcost.Type.Percentage:
					switch (mod.affects) {
						case affects.Option.Total:
							if (modifier < 0) {
								baseLim += modifier
								levelLim += modifier
							} else {
								baseEnh += modifier
								levelEnh += modifier
							}
							break
						case affects.Option.BaseOnly:
							if (modifier < 0) {
								baseLim += modifier
							} else {
								baseEnh += modifier
							}
							break
						case affects.Option.LevelsOnly:
							if (modifier < 0) {
								levelLim += modifier
							} else {
								levelEnh += modifier
							}
							break
					}
					break
				case tmcost.Type.Points:
					if (mod.affects === affects.Option.LevelsOnly) {
						if (this.isLeveled) pointsPerLevel += modifier
						else basePoints += modifier
					}
					break
				case tmcost.Type.Multiplier:
					multiplier *= modifier
			}
		})

		let modifiedBasePoints = basePoints
		const leveledPoints = pointsPerLevel * levels

		if (baseEnh !== 0 || baseLim !== 0 || levelEnh !== 0 || levelLim !== 0) {
			if (sheetSettingsFor(this.actor).use_multiplicative_modifiers) {
				if (baseEnh === levelEnh && baseLim === levelLim) {
					modifiedBasePoints = modifyPoints(
						modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
						Math.max(-80, baseLim),
					)
				} else {
					modifiedBasePoints =
						modifyPoints(
							modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
							Math.max(-80, baseLim),
						) + modifyPoints(modifyPoints(leveledPoints, levelEnh), Math.max(-80, levelLim))
				}
			} else {
				const baseMod = Math.max(-80, baseEnh + baseLim)
				const levelMod = Math.max(-80, baseEnh + levelLim)
				if (baseMod === levelMod) {
					modifiedBasePoints = modifyPoints(modifiedBasePoints + leveledPoints, baseMod)
				} else {
					modifiedBasePoints =
						modifyPoints(modifiedBasePoints, baseMod) + modifyPoints(leveledPoints, levelMod)
				}
			}
		} else {
			modifiedBasePoints += leveledPoints
		}
		return this.system.round_down
			? Math.floor(modifiedBasePoints * multiplier)
			: Math.ceil(modifiedBasePoints * multiplier)
	}

	get skillLevel(): number {
		return this.CR
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

	get modifierNotes(): string {
		const buffer = new StringBuilder()
		if (this.CR !== selfctrl.Roll.NoCR) {
			buffer.push(selfctrl.Roll.toRollableButton(this.CR))
			if (this.CRAdj !== selfctrl.Adjustment.NoCRAdj) {
				if (buffer.length !== 0) buffer.push(", ")
				buffer.push(selfctrl.Adjustment.description(this.CRAdj, this.CR))
			}
		}
		this.deepModifiers.forEach(mod => {
			if (!mod.enabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.fullDescription)
		})
		return buffer.toString()
	}

	get studyHours(): number {
		return resolveStudyHours(this.system.study ?? [])
	}

	get studyHoursNeeded(): string {
		const system = this.system
		if ((system.study_hours_needed as string) === "") return study.Level.Standard
		return system.study_hours_needed
	}

	override getContextMenuItems(): ContextMenuEntry[] {
		return [
			{
				name: LocalizeGURPS.translations.gurps.context.new_item.trait,
				icon: "",
				callback: async () => {
					return this.createSiblingDocuments("Item", [
						{
							type: ItemType.Trait,
							name: LocalizeGURPS.translations.TYPES.Item[ItemType.Trait],
						},
					])
				},
			},
			{
				name: LocalizeGURPS.translations.gurps.context.new_item.trait_container,
				icon: "",
				callback: async () => {
					return this.createSiblingDocuments("Item", [
						{
							type: ItemType.TraitContainer,
							name: LocalizeGURPS.translations.TYPES.Item[ItemType.TraitContainer],
						},
					])
				},
			},
			...super.getContextMenuItems(),
			{
				name: LocalizeGURPS.translations.gurps.context.toggle_state,
				icon: "",
				callback: async () => {
					return this.update({ "system.disabled": !this.system.disabled })
				},
			},
		]
	}
}

interface TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitSource
	system: TraitSystemData
}

export { TraitGURPS }
