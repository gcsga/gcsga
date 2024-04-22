import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "./data.ts"
import { ActorType, ItemFlags, ItemType, RollType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS, TooltipGURPS, includesFold, stdmg } from "@util"
import { WeaponParry } from "@item/abstract-weapon/weapon-parry.ts"
import { WeaponBlock } from "@item/abstract-weapon/weapon-block.ts"
import { WeaponReach } from "@item/abstract-weapon/weapon-reach.ts"
import { SkillDefault } from "@system"

const fields = foundry.data.fields

class MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	declare parry: WeaponParry
	declare block: WeaponBlock
	declare reach: WeaponReach

	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.MeleeWeapon }),
				strength: new fields.StringField({ initial: "0" }),
				usage: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.MeleeWeapon],
				}),
				usage_notes: new fields.StringField(),
				defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
				damage: new fields.SchemaField({
					type: new fields.StringField({ initial: "cr" }),
					st: new fields.StringField<stdmg.Option>({ choices: stdmg.Options, initial: stdmg.Option.Thrust }),
					base: new fields.StringField(),
					armor_divisor: new fields.NumberField({ min: 0, initial: 1 }),
					fragmentation: new fields.StringField(),
					fragmentation_armor_divisor: new fields.NumberField({ min: 0, initial: 1 }),
					fragmentation_type: new fields.StringField(),
					modifier_per_die: new fields.NumberField({ initial: 0 }),
				}),
				reach: new fields.StringField({ initial: "1" }),
				parry: new fields.StringField({ initial: "No" }),
				block: new fields.StringField({ initial: "No" }),
			}),
		})
	}

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
