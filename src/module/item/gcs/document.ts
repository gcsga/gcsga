import { ActorGURPS } from "@actor/base.ts"
import { ContainerGURPS } from "@item/container/document.ts"
import { ItemType, SYSTEM_NAME } from "@module/data/misc.ts"
import { UserGURPS } from "@module/user/document.ts"
import { study } from "@util/enum/study.ts"
import { resolveStudyHours } from "@util/study.ts"
import { ItemGCSSystemData } from "./data.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { display } from "@util/enum/display.ts"
import { sheetDisplayNotes } from "@util/misc.ts"
import { CharacterResolver, SkillResolver } from "@util/resolvers.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { Feature, FeatureObj } from "@feature/index.ts"
import { feature } from "@util/enum/feature.ts"
import { PrereqList } from "@prereq/index.ts"
import { MeleeWeaponGURPS } from "@item/melee_weapon/index.ts"
import { RangedWeaponGURPS } from "@item/ranged_weapon/index.ts"
import { BaseWeaponGURPS } from "@item/weapon/index.ts"

export interface ItemGCS<TParent extends ActorGURPS = ActorGURPS> extends ContainerGURPS<TParent> {
	system: ItemGCSSystemData
}

export abstract class ItemGCS<TParent extends ActorGURPS = ActorGURPS> extends ContainerGURPS<TParent> {
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
		if (this._source.img === (foundry.documents.BaseItem as any).DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`
		let gcs_type: string = data.type
		if (gcs_type === ItemType.Equipment) gcs_type = "equipment"
		;(this._source.system as any).type = gcs_type
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

	get studyHours(): number {
		return resolveStudyHours((this.system as any).study ?? [])
	}

	get studyHoursNeeded(): string {
		const system = this.system as any
		if (system.study_hours_needed === "") return study.Level.Standard
		return system.study_hours_needed
	}

	get localNotes(): string {
		return this.system.notes ?? ""
	}

	get notes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.localNotes, this.actor as unknown as CharacterResolver)
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
		if (!this.system.hasOwnProperty("features")) return []

		return (this.system as any).features.map((e: Partial<FeatureObj>) => {
			const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
			const f = FeatureConstructor.fromObject(e as any)
			if (this.isLeveled) f.setLevel(this.levels)
			return f
		})
	}

	get prereqs() {
		if (!(this.system as any).prereqs) return new PrereqList()
		return PrereqList.fromObject((this.system as any).prereqs)
	}

	get prereqsEmpty(): boolean {
		if (!(this.system as any).prereqs.prereqs) return true
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

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof BaseWeaponGURPS) weapons.set(item.id, item)
		}
		return weapons
	}

	override exportSystemData(_keepOther: boolean): any {
		const system: any = this.system
		system.name = this.name
		if (system.features)
			system.features = system.features.map((e: Feature) => {
				const { effective: _, ...rest } = e
				return rest
			})
		if ((this as any).children)
			system.children = (this as any).children.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).modifiers)
			system.modifiers = (this as any).modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).weapons)
			system.weapons = (this as any).weapons.map((e: BaseWeaponGURPS) => e.exportSystemData(false))
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
