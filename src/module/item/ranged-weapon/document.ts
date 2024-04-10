import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { RangedWeaponSource, RangedWeaponSystemData } from "./data.ts"
import { ActorType, ItemFlags, ItemType, RollType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS, TooltipGURPS, includesFold, stdmg } from "@util"
import { WeaponAccuracy } from "@item/abstract-weapon/weapon-accuracy.ts"
import { WeaponRange } from "@item/abstract-weapon/weapon-range.ts"
import { WeaponROF } from "@item/abstract-weapon/weapon-rof.ts"
import { WeaponShots } from "@item/abstract-weapon/weapon-shots.ts"
import { WeaponBulk } from "@item/abstract-weapon/weapon-bulk.ts"
import { WeaponRecoil } from "@item/abstract-weapon/weapon-recoil.ts"
import { SkillDefault } from "@system"

const fields = foundry.data.fields

class RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	declare accuracy: WeaponAccuracy
	declare range: WeaponRange
	declare ROF: WeaponROF
	declare rate_of_fire: WeaponROF
	declare shots: WeaponShots
	declare bulk: WeaponBulk
	declare recoil: WeaponRecoil

	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.RangedWeapon }),
				strength: new fields.StringField({ initial: "0" }),
				usage: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.RangedWeapon],
				}),
				usage_notes: new fields.StringField(),
				defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
				damage: new fields.SchemaField({
					type: new fields.StringField({ initial: "cr" }),
					st: new fields.StringField<stdmg.Option>({ choices: stdmg.Options, initial: stdmg.Option.None }),
					base: new fields.StringField({ initial: "+1d" }),
					armor_divisor: new fields.NumberField({ min: 0, initial: 1 }),
					fragmentation: new fields.StringField(),
					fragmentation_armor_divisor: new fields.NumberField({ min: 0, initial: 1 }),
					fragmentation_type: new fields.StringField(),
					modifier_per_die: new fields.NumberField({ initial: 0 }),
				}),
				accuracy: new fields.StringField({ initial: "0" }),
				range: new fields.StringField({ initial: "" }),
				rate_of_fire: new fields.StringField({ initial: "1" }),
				shots: new fields.StringField({ initial: "0" }),
				bulk: new fields.StringField({ initial: "0" }),
				recoil: new fields.StringField({ initial: "0" }),
			}),
		})
	}

	checkUnready(type: RollType): void {
		const check = game.settings.get(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY)
		if (!check) return
		if (!this.actor) return
		let unready = false
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
		this.accuracy = WeaponAccuracy.parse(this.system.accuracy)
		this.range = WeaponRange.parse(this.system.accuracy)
		this.ROF = WeaponROF.parse(this.system.rate_of_fire)
		this.shots = WeaponShots.parse(this.system.shots)
		this.bulk = WeaponBulk.parse(this.system.bulk)
		this.recoil = WeaponRecoil.parse(this.system.recoil)

		this.accuracy.current = this.accuracy.resolve(this, new TooltipGURPS()).toString()
		this.range.current = this.range.resolve(this, new TooltipGURPS()).toString(true)
		this.ROF.current = this.ROF.resolve(this, new TooltipGURPS()).toString()
		this.shots.current = this.shots.resolve(this, new TooltipGURPS()).toString()
		this.bulk.current = this.bulk.resolve(this, new TooltipGURPS()).toString()
		this.recoil.current = this.recoil.resolve(this, new TooltipGURPS()).toString()

		this.rate_of_fire = this.ROF
	}
}

interface RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractWeaponGURPS<TParent> {
	readonly _source: RangedWeaponSource
	system: RangedWeaponSystemData
}

export { RangedWeaponGURPS }
