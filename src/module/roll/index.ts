import { ActorGURPS, CharacterGURPS } from "@actor"
import { RollType, SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"
import { UserFlags, UserGURPS } from "@module/user/index.ts"
import { CharacterResolver, objectHasKey } from "@util"
import { RollTypeData, rollTypeHandlers } from "./roll_handler.ts"

export class RollGURPS extends Roll {
	originalFormula = ""

	usingMod = false

	system: Record<string, unknown> = {}

	static override CHAT_TEMPLATE = `systems/${SYSTEM_NAME}/templates/dice/roll.hbs`

	static override TOOLTIP_TEMPLATE = `systems/${SYSTEM_NAME}/templates/dice/tooltip.hbs`

	constructor(formula: string, data?: Record<string, unknown>, options?: RollOptions) {
		const originalFormula = formula
		// Formula = formula.replace(/([0-9]+)[dD]([\D])/g, "$1d6$2")
		// formula = formula.replace(/([0-9]+)[dD]$/g, "$1d6")
		super(formula, data, options)

		this.usingMod = formula.includes("@gmod")
		this.originalFormula = originalFormula
	}

	override get formula(): string {
		return this.originalFormula
			.replace(/d6/g, "d")
			.replace(/\*/g, "x")
			.replace(/\+\s*@gmod[c]?/g, "")
			.trim()
	}

	static override replaceFormulaData(
		formula: string,
		data: Record<string, unknown>,
		{ missing, warn }: { missing?: string; warn?: boolean },
	): string {
		super.replaceFormulaData(formula, data)
		const dataRgx = new RegExp(/\$([a-z.0-9_-]+)/gi)
		const newFormula = formula.replace(dataRgx, (match, term) => {
			if (data.actor) {
				const actor = data.actor as CharacterResolver
				const value = actor.resolveVariable(term.replace("$", "")) ?? null
				if (value === null) {
					if (warn && ui.notifications)
						ui.notifications.warn(game.i18n.format("DICE.WarnMissingData", { match }))
					return missing !== undefined ? String(missing) : match
				}
				return String(value).trim()
			}
			return ""
		})
		return super.replaceFormulaData(newFormula, data, { missing, warn })
	}

	protected override _prepareData(data: Record<string, unknown>): Record<string, unknown> {
		const d = super._prepareData(data) ?? {}
		// d.gmod = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal)
		d.gmod = (game.user as UserGURPS)?.modifierTotal
		if (!objectHasKey(d, "gmodc"))
			Object.defineProperty(d, "gmodc", {
				get() {
					// const mod = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal) as number
					const mod = (game.user as UserGURPS)?.modifierTotal
					game.gurps.modifierBucket.clear()
					return mod
				},
			})
		return d
	}

	/**
	 * Master function to handle various types of roll
	 * @param {UserGURPS} user
	 * @param {ActorGURPS} actor
	 * @param data
	 */
	static async handleRoll(
		user: UserGURPS | null,
		actor: ActorGURPS | null,
		data: Partial<RollTypeData>,
	): Promise<void> {
		console.log("handleRoll", user, actor, data)
		if (actor instanceof CharacterGURPS) {
			const lastStack = user?.flags[SYSTEM_NAME][UserFlags.ModifierStack]
			await user?.setFlag(SYSTEM_NAME, UserFlags.LastStack, lastStack)
		}

		return rollTypeHandlers[data.type as RollType].handleRollType(
			user,
			actor,
			data as RollTypeData,
			game.settings.get(SYSTEM_NAME, SETTINGS.ROLL_FORMULA) || "3d6",
			data.hidden ?? false,
		)
	}
}
