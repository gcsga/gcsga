import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "./data.ts"
import { ActorType, ItemFlags, RollType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { TooltipGURPS, includesFold } from "@util"
import { WeaponParry } from "@item/abstract-weapon/weapon-parry.ts"
import { WeaponBlock } from "@item/abstract-weapon/weapon-block.ts"
import { WeaponReach } from "@item/abstract-weapon/weapon-reach.ts"

class MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	declare parry: WeaponParry
	declare block: WeaponBlock
	declare reach: WeaponReach

	checkUnready(type: RollType): void {
		const check = game.settings.get(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY)
		if (!check) return
		if (!this.actor) return
		let unready = false
		if (this.parry.unbalanced) unready = true
		if (type === RollType.Attack) {
			let twoHanded = false
			if (
				includesFold(this.usage, "two-handed") ||
				includesFold(this.usage, "two handed") ||
				includesFold(this.usage, "2-handed") ||
				includesFold(this.system.usage_notes, "two-handed") ||
				includesFold(this.system.usage_notes, "two handed") ||
				includesFold(this.system.usage_notes, "2-handed")
			)
				twoHanded = true
			const st = this.strength.min ?? 0
			const actorST = this.actor.isOfType(ActorType.Character) ? this.actor.strengthOrZero : 0
			if (twoHanded) {
				if (this.strength.twoHandedUnready && actorST < st * 1.5) unready = true
			} else {
				if (this.strength.twoHandedUnready && actorST < st * 3) unready = true
				if (this.strength.twoHanded && actorST < st * 2) unready = true
			}
		}
		this.setFlag(SYSTEM_NAME, ItemFlags.Unready, unready)
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.parry = WeaponParry.parse(this.system.parry)
		this.block = WeaponBlock.parse(this.system.block)
		this.reach = WeaponReach.parse(this.system.reach)

		this.parry.current = this.parry.resolve(this, new TooltipGURPS()).toString()
		this.block.current = this.block.resolve(this, new TooltipGURPS()).toString()
		this.reach.current = this.reach.resolve(this, new TooltipGURPS()).toString()
	}
}

interface MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	readonly _source: MeleeWeaponSource
	system: MeleeWeaponSystemData
}

export { MeleeWeaponGURPS }
