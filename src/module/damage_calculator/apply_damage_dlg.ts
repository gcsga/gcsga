import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { toWord } from "@util/misc"
import { DamageRoll, DamageTarget } from "."
import { DamageCalculator } from "./damage_calculator"
import { DamageTypes } from "./damage_type"
import { HitLocationUtil } from "./hitlocation_utils"

const Vulnerability = "Vulnerability"
const Injury_Tolerance = "Injury Tolerance"
const Damage_Reduction = "Damage Reduction"
const InjuryTolerance_DamageReduction = "Injury Tolerance (Damage Reduction)"

class ApplyDamageDialog extends Application {
	static async create(roll: DamageRoll, target: DamageTarget, options = {}): Promise<ApplyDamageDialog> {
		const dialog = new ApplyDamageDialog(roll, target, options)

		if (dialog.calculator.damageRoll.locationId === "Random") {
			dialog.calculator.damageRoll.locationId = await dialog._rollRandomLocation()
		}

		return dialog
	}

	private calculator: DamageCalculator

	/**
	 * Use the static create() method, above, so that we can properly defer returning an instance until after we resolve
	 * a "Random" hit location.
	 *
	 * @param roll
	 * @param target
	 * @param options
	 */
	private constructor(roll: DamageRoll, target: DamageTarget, options = {}) {
		super(options)
		this.calculator = new DamageCalculator(roll, target, game.i18n.format.bind(game.i18n))
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: true,
			minimizable: false,
			resizable: true,
			width: 0,
			height: "auto",
			id: "ApplyDamageDialog",
			template: `systems/${SYSTEM_NAME}/templates/damage_calculator/apply-damage.hbs`,
			classes: ["apply-damage", "gurps"],
		})
	}

	get title() {
		return game.i18n.localize("Apply Damage")
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object {
		const books = game.settings.get(SYSTEM_NAME, SETTINGS.BASE_BOOKS) as "gurps" | "dfrpg"

		const data = mergeObject(super.getData(options), {
			calculator: this.calculator,
			choices: this.choices,
			books,
		})
		return data
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		html.find("[data-control]").on("change click", event => this._onApplyControl(event))
		html.find("[data-action]").on("change click", event => this._onApplyControl(event))
		html.find(".ref").on("click", event => PDF.handle(event))
	}

	_onApplyControl(event: JQuery.Event) {
		if (event.type === "click") {
			const e = event as JQuery.ClickEvent
			if (["button", "checkbox"].includes(e.currentTarget.type)) {
				this._onApplyControlClick(e, e.currentTarget)
			}
		}

		if (event.type === "change") {
			const e = event as JQuery.ChangeEvent
			if (["number", "select-one"].includes(e.currentTarget.type)) {
				this._onApplyControlChange(e, e.currentTarget)
			}
		}
	}

	async _onApplyControlChange(event: JQuery.ChangeEvent, target: any): Promise<void> {
		event.preventDefault()

		switch (target.dataset.action) {
			case "location-select": {
				const value = parseInt(target.value)
				this.calculator.damageRoll.locationId = target.value
				break
			}

			case "hardened-select": {
				this.calculator.overrideHardenedDR = target.value
				break
			}

			case "override-dr": {
				const value = parseInt(target.value)
				this.calculator.overrideDamageResistance = isNaN(value) ? undefined : value
				break
			}

			case "override-basic": {
				const value = parseInt(target.value)
				this.calculator.overrideBasicDamage = isNaN(value) ? undefined : value
				break
			}

			case "armordivisor-select": {
				const value = parseFloat(target.value)
				this.calculator.overrideArmorDivisor = isNaN(value) ? undefined : value
				break
			}

			case "damagetype-select": {
				this.calculator.overrideDamageType = target.value
				break
			}

			case "override-woundingmod": {
				const value = parseFloat(target.value)
				this.calculator.overrideWoundingModifier = isNaN(value) ? undefined : value
				break
			}

			case "override-vulnerability": {
				const value = parseInt(target.value)
				this.calculator.overrideVulnerability = isNaN(value) ? undefined : value
				break
			}

			case "tolerance-select": {
				this.calculator.overrideInjuryTolerance = target.value
				break
			}

			case "override-reduction": {
				const value = parseFloat(target.value)
				this.calculator.overrideDamageReduction = isNaN(value) ? undefined : value
				break
			}
		}

		this.render(true)
	}

	async _onApplyControlClick(event: JQuery.ClickEvent, target: any): Promise<void> {
		event.preventDefault()

		switch (target.dataset.action) {
			case "location-random":
				this.calculator.damageRoll.locationId = await this._rollRandomLocation()
				break

			case "location-flexible":
				this.calculator.overrideFlexible(!this.calculator.isFlexibleArmor)
				break

			case "apply-basic":
				this.calculator.target.incrementDamage(this.calculator.results.rawDamage!.value)
				break

			case "apply-injury":
				this.calculator.target.incrementDamage(this.calculator.results.injury!.value)
				break

			case "reset-form":
				this.calculator.resetOverrides()
				break

			case "apply-vulnerability":
				const index = parseInt(target.dataset.index)
				this.calculator.applyVulnerability(index, target.checked)
		}

		this.render(true)
	}

	async _rollRandomLocation(): Promise<string> {
		let result = await HitLocationUtil.rollRandomLocation(this.target.hitLocationTable)

		// Get localized version of the location id, if necessary.
		const location = result.location?.choice_name ?? "Torso"

		// Create an array suitable for drawing the dice on the ChatMessage.
		const rolls = result.roll.dice[0].results.map(e => {
			return { result: e.result, word: toWord(e.result) }
		})

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/random-location-roll.hbs`, {
			location: location,
			rolls: rolls,
			total: result.roll.total,
		})

		let messageData = {
			user: game.user,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			roll: JSON.stringify(result.roll),
			sound: CONFIG.sounds.dice,
		}

		ChatMessage.create(messageData, {})

		return result.location?.id ?? "torso"
	}

	private get target(): DamageTarget {
		return this.calculator.target
	}

	private get choices() {
		return {
			hardened: hardenedChoices,
			damageType: this.damageTypeChoice,
			vulnerability: vulnerabilityChoices,
			hitlocation: this.hitLocationChoice,
		}
	}

	private get damageTypeChoice(): Record<string, string> {
		let results: Record<string, string> = {}
		Object.entries(DamageTypes).map(e => (results[e[0]] = e[1].full_name))
		return results
	}

	private get hitLocationChoice(): Record<string, string> {
		const choice: Record<string, string> = {}
		this.target.hitLocationTable.locations.forEach(it => (choice[it.id] = it.choice_name))
		return choice
	}
}

const hardenedChoices = {
	0: "None (0)",
	1: "1",
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
}

const vulnerabilityChoices = {
	1: "None",
	2: "×2",
	3: "×3",
	4: "×4",
}

export { ApplyDamageDialog }
