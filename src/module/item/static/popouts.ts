import { SYSTEM_NAME } from "@module/data/index.ts"
import { StaticItemGURPS } from "./document.ts"

export enum StaticPopoutType {
	Melee = "melee",
	Ranged = "ranged",
	Spell = "spells",
	Trait = "ads",
	Skill = "skills",
}

export class StaticPopout extends FormApplication {
	declare object: StaticItemGURPS

	key!: StaticPopoutType

	uuid!: string

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["form", "gurps", "item"],
			width: 620,
			min_width: 620,
			height: 800,
			resizable: true,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
		})
	}

	override get title(): string {
		switch (this.key) {
			case StaticPopoutType.Melee:
			case StaticPopoutType.Ranged:
				return this.object.system[this.key][this.uuid].mode
			case StaticPopoutType.Skill:
			case StaticPopoutType.Trait:
			case StaticPopoutType.Spell:
				return this.object.system[this.key][this.uuid].name
			default:
				return ""
		}
	}

	constructor(object: StaticItemGURPS, key: StaticPopoutType, uuid: string, options?: { ready?: boolean }) {
		options ??= {}
		if (options.ready && options.ready === true) {
			super(object)
			this.object = object
			this.key = key
			this.uuid = uuid
		} else {
			fu.mergeObject(options, { ready: true })
			switch (key) {
				case StaticPopoutType.Melee:
					return new StaticMeleePopout(object, key, uuid, options)
				case StaticPopoutType.Ranged:
					return new StaticRangedPopout(object, key, uuid, options)
				case StaticPopoutType.Spell:
					return new StaticSpellPopout(object, key, uuid, options)
				case StaticPopoutType.Trait:
					return new StaticTraitPopout(object, key, uuid, options)
				case StaticPopoutType.Skill:
					return new StaticSkillPopout(object, key, uuid, options)
				default:
					return new StaticPopout(object, key, uuid, options)
			}
		}
	}

	override getData(options?: Partial<FormApplicationOptions> | undefined): object | Promise<object> {
		return fu.mergeObject(super.getData(options), {
			list: this.key,
			key: this.uuid,
			data: this.object.system[this.key][this.uuid],
		})
	}

	protected async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<unknown> {
		if (!this.object.uuid) return
		await this.object.update(formData)
		return this.render()
	}
}

export class StaticMeleePopout extends StaticPopout {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/legacy_equipment/popouts/melee.hbs`
	}
}
export class StaticRangedPopout extends StaticPopout {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/legacy_equipment/popouts/ranged.hbs`
	}
}
export class StaticTraitPopout extends StaticPopout {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/legacy_equipment/popouts/trait.hbs`
	}
}
export class StaticSkillPopout extends StaticPopout {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/legacy_equipment/popouts/skill.hbs`
	}
}
export class StaticSpellPopout extends StaticPopout {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/legacy_equipment/popouts/spell.hbs`
	}
}
