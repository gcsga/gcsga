import { ActorGURPS2 } from "@module/document/actor.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { gid } from "../constants.ts"

function getAttributeChoices(
	actor: ActorGURPS2 | null,
	current: string,
	localizationKey = "",
	options = { blank: false, ten: false, size: false, dodge: false, parry: false, block: false, skill: false },
): { choices: Record<string, string>; current: string } {
	const list = SheetSettings.for(actor).attributes.filter(e => !e.isSeparator)
	const choices = <Record<string, string>>{}
	if (options.blank) choices[""] = ""
	if (options.ten) choices["10"] = game.i18n.format(localizationKey, { value: "10" })
	let addedDodge = false
	for (const def of list) {
		if (def.id === gid.Dodge) {
			if (!options.dodge) continue
			addedDodge = true
		}
		choices[def.id] = game.i18n.format(localizationKey, { value: def.name })
	}

	if (options.size)
		choices[gid.SizeModifier] = game.i18n.format(localizationKey, {
			value: game.i18n.localize("GURPS.Attribute.SizeModifier"),
		})
	if (options.dodge && !addedDodge)
		choices[gid.Dodge] = game.i18n.format(localizationKey, { value: game.i18n.localize("GURPS.Attribute.Dodge") })
	if (options.parry)
		choices[gid.Parry] = game.i18n.format(localizationKey, { value: game.i18n.localize("GURPS.Attribute.Parry") })
	if (options.block)
		choices[gid.Block] = game.i18n.format(localizationKey, { value: game.i18n.localize("GURPS.Attribute.Block") })
	if (options.skill)
		choices[gid.Skill] = game.i18n.format(localizationKey, { value: game.i18n.localize("GURPS.Attribute.Skill") })

	if (Object.keys(choices).includes(current)) return { choices, current }
	choices[current] = game.i18n.format("GURPS.Attribute.Unknown", { value: current })
	return { choices, current }
}

export { getAttributeChoices }
