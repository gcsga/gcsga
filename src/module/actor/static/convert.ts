import { CharacterGURPS, CharacterSystemData } from "@actor/character"
import { StaticCharacterGURPS } from "./document"
import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { AttributeDef } from "@module/attribute"
import { StaticResourceThreshold, StaticThresholdComparison } from "./data"

export class CharacterConverter {
	public static update(actor: StaticCharacterGURPS): CharacterGURPS {
		const converter = new CharacterConverter()
		return converter._update(actor)
	}

	private _update(actor: StaticCharacterGURPS): CharacterGURPS {
		const newData: Partial<CharacterSystemData> = {}
		newData.settings = {
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
			body_type: {
				name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
				roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
				locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
			},
			attributes: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
			resource_trackers: Object.values(actor.system.additionalresources.tracker).map(e => {
				return {
					id: e.alias.toLowerCase(),
					name: e.alias,
					full_name: e.name,
					max: e.max,
					min: e.min,
					isMaxEnforced: e.isMaxEnforced,
					isMinEnforced: e.isMinEnforced,
					thresholds: e.thresholds.map(f => {
						return {
							state: f.condition,
							explanation: "",
							expression: this._getThresholdExpression(f),
							ops: [],
						}
					}),
				}
			}),
		}

		return new CharacterGURPS({} as any)
	}

	private _getThresholdExpression(comparison: StaticResourceThreshold): string {
		switch (comparison.comparison) {
			case StaticThresholdComparison.LessThan:
				return ""
			default:
				return ""
		}
	}
}
