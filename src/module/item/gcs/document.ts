import { ActorGURPS } from "@actor/base.ts"
import { ContainerGURPS } from "@item/container/document.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"
import { UserGURPS } from "@module/user/document.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "./data.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { display } from "@util/enum/display.ts"
import { sheetDisplayNotes } from "@util/misc.ts"
import { SkillResolver } from "@util/resolvers.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { Feature, FeatureObj } from "@feature/index.ts"
import { feature } from "@util/enum/feature.ts"
import { PrereqList } from "@prereq/index.ts"
import { MeleeWeaponGURPS } from "@item/melee_weapon/index.ts"
import { RangedWeaponGURPS } from "@item/ranged_weapon/index.ts"
import { ItemType } from "@item/types.ts"
import { BaseWeaponGURPS } from "@item"

export interface ItemGCS<TParent extends ActorGURPS | null> extends ContainerGURPS<TParent> {
	readonly _source: ItemGCSSource
	system: ItemGCSSystemSource
}

export abstract class ItemGCS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ContainerGURPS<TParent> {
	declare unsatisfiedReason: string
	// unsatisfied_reason = ""

	protected override async _preCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		user: UserGURPS,
	): Promise<void> {
		let type = data.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		if (this._source.img === foundry.documents.BaseItem.DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`
		let gcs_type = data.type
		if (gcs_type === ItemType.Equipment) gcs_type = "equipment" as ItemType
		this._source.system.type = gcs_type
		await super._preCreate(data, options, user)
	}

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
			if (this.isLeveled) f.setLevel(this.levels)
			return f
		})
	}

	get prereqs(): PrereqList {
		if (!this.system.prereqs) return new PrereqList()
		return PrereqList.fromObject(this.system.prereqs)
	}

	get prereqsEmpty(): boolean {
		if (!this.system.prereqs || !this.system.prereqs.prereqs) return true
		return this.prereqs?.prereqs.length === 0
	}

	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item.id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item.id, item)
		}
		return rangedWeapons
	}

	override get children(): Collection<ItemGCS> {
		return super.children as Collection<ItemGCS>
	}

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof BaseWeaponGURPS) weapons.set(item.id, item)
		}
		return weapons
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
		if (this.children) system.children = this.children.map((e: ItemGCS) => e.exportSystemData(false))
		if (this.modifiers) system.modifiers = this.modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if (this.weapons) system.weapons = this.weapons.map((e: BaseWeaponGURPS) => e.exportSystemData(false))
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
