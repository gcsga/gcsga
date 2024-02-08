import { ActorGURPS } from "@actor/base.ts"
import { ItemType } from "@data"
import { ContainedWeightReduction, Feature, FeatureObj } from "@feature/index.ts"
import { ItemSourceGCS } from "@item/base/data/index.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ContainerGURPS } from "@item/container/document.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { display } from "@util/enum/display.ts"
import { feature } from "@util/enum/feature.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { sheetDisplayNotes } from "@util/misc.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { CharacterResolver, SkillResolver } from "@util/resolvers.ts"
import { ItemGCSSystemSource } from "./data.ts"
import { ItemInstances } from "@item/types.ts"

export interface ItemGCS<TParent extends ActorGURPS | null> extends ContainerGURPS<TParent> {
	readonly _source: ItemSourceGCS
	system: ItemGCSSystemSource
}

export abstract class ItemGCS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ContainerGURPS<TParent> {
	declare unsatisfiedReason: string
	// unsatisfied_reason = ""

	override async update(
		data: Record<string, unknown>,
		context?: DocumentModificationContext<TParent>,
	): Promise<this | undefined> {
		// if (this.parent instanceof Actor && context?.noPrepare) this.parent.noPrepare = true
		return super.update(data, context)
	}

	// get unsatisfiedReason(): string {
	// 	return ""
	// }

	get localNotes(): string {
		// @ts-expect-error doesn't exist here but does elsewhere
		return this.system.notes ?? ""
	}

	get notes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.localNotes, this.actor)
	}

	get ratedStrength(): number {
		return 0
	}

	get formattedName(): string {
		return this.name ?? ""
	}

	get enabled(): boolean {
		return true
	}

	get tags(): string[] {
		// @ts-expect-error doesn't exist here but does elsewhere
		return this.system.tags
	}

	secondaryText(_optionChecker: (option: display.Option) => boolean): string {
		return ""
	}

	get resolvedNotes(): string {
		return sheetDisplayNotes(this.secondaryText(display.Option.isInline))
	}

	get resolvedTooltip(): string {
		return this.secondaryText(display.Option.isTooltip)
	}

	get levelTooltip(): string {
		if ([ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell].includes(this.type)) {
			const sk = this as unknown as SkillResolver
			if (sk.level.tooltip.length === 0) return ""
			const tooltip = new TooltipGURPS()
			tooltip.push(`${LocalizeGURPS.translations.gurps.common.includes_modifiers_from}:<br>`)
			tooltip.push(sk.level.tooltip)
			return tooltip.toString()
		}
		return ""
	}

	get pointsTooltip(): string {
		if ([ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell].includes(this.type)) {
			const sk = this as unknown as SkillResolver
			const tooltip = new TooltipGURPS()
			sk.adjustedPoints(tooltip)
			if (tooltip.length)
				tooltip.unshift(`${LocalizeGURPS.translations.gurps.common.includes_modifiers_from}:<br>`)
			return tooltip.toString()
		}
		return ""
	}

	get reference(): string {
		// @ts-expect-error doesn't exist here but does elsewhere
		return this.system.reference
	}

	get isLeveled(): boolean {
		return false
	}

	get levels(): number {
		return 0
	}

	get features(): Feature[] {
		if (!this.system.features) return []
		return this.system.features.map((e: Partial<FeatureObj>) => {
			const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
			// @ts-expect-error conflicting types in constructors
			const f = FeatureConstructor.fromObject(e as FeatureObj)
			if (this.isLeveled && !(f instanceof ContainedWeightReduction)) f.setLevel(this.levels)
			return f
		})
	}

	get prereqs(): PrereqList {
		if (!this.system.prereqs) return new PrereqList()
		return PrereqList.fromObject(this.system.prereqs, this.actor as unknown as CharacterResolver)
	}

	get prereqsEmpty(): boolean {
		if (!this.system.prereqs || !this.system.prereqs.prereqs) return true
		return this.prereqs?.prereqs.length === 0
	}

	get meleeWeapons(): Collection<ItemInstances<TParent>[ItemType.MeleeWeapon]> {
		const meleeWeapons: Collection<ItemGURPS> = new Collection()
		for (const item of this.items) {
			if (item.isOfType(ItemType.MeleeWeapon)) meleeWeapons.set(item.id, item)
		}
		return meleeWeapons as Collection<ItemInstances<TParent>[ItemType.MeleeWeapon]>
	}

	get rangedWeapons(): Collection<ItemInstances<TParent>[ItemType.RangedWeapon]> {
		const rangedWeapons: Collection<ItemGURPS> = new Collection()
		for (const item of this.items) {
			if (item.isOfType(ItemType.RangedWeapon)) rangedWeapons.set(item.id, item)
		}
		return rangedWeapons as Collection<ItemInstances<TParent>[ItemType.RangedWeapon]>
	}

	get weapons(): Collection<
		ItemInstances<TParent>[ItemType.MeleeWeapon] | ItemInstances<TParent>[ItemType.RangedWeapon]
	> {
		const weapons: Collection<ItemGURPS> = new Collection()
		for (const item of this.items) {
			if (item.isOfType(ItemType.MeleeWeapon)) weapons.set(item.id, item)
			if (item.isOfType(ItemType.RangedWeapon)) weapons.set(item.id, item)
		}
		return weapons as Collection<
			ItemInstances<TParent>[ItemType.MeleeWeapon] | ItemInstances<TParent>[ItemType.RangedWeapon]
		>
	}

	get modifiers(): Collection<ItemGCS> {
		return new Collection()
	}

	override exportSystemData(_keepOther: boolean): Record<string, unknown> {
		const system = { ...this.system } as Record<string, unknown>
		system.name = this.name
		if (this.features)
			system.features = this.features.map((e: Feature) => {
				const { effective: _, ...rest } = e
				return rest
			})
		if (this.children) system.children = this.children.map((e: ItemGURPS) => e.exportSystemData(false))
		if (this.modifiers) system.modifiers = this.modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if (this.weapons) system.weapons = this.weapons.map((e: ItemGURPS) => e.exportSystemData(false))
		return system
	}

	override prepareData(): void {
		if (this.parent?.noPrepare) return
		if ([ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell].includes(this.type)) {
			const sk = this as unknown as SkillResolver
			sk.level = sk.calculateLevel()
		}
		super.prepareData()
	}
}
