import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { toWord } from "@util/misc"
import { DamageRoll, DamageTarget } from "."
import { IDamageCalculator, createDamageCalculator } from "./damage_calculator"
import { DamageTypes } from "./damage_type"
import { HitLocationUtil } from "./hitlocation_utils"

class ApplyDamageDialog extends Application {
	static async create(roll: DamageRoll, target: DamageTarget, options = {}): Promise<ApplyDamageDialog> {
		roll.hits.forEach(async it => {
			if (it.locationId === "Random") {
				it.locationId = await new ApplyDamageDialog(roll, target, options)._rollRandomLocation()
			}
		})

		return new ApplyDamageDialog(roll, target, options)
	}

	/**
	 * Use the static create() method, above, so that we can properly defer returning an instance until after we resolve
	 * a "Random" hit location.
	 *
	 * @param roll
	 * @param target
	 * @param options
	 */
	private constructor(roll: DamageRoll, target: DamageTarget, options: any = {}) {
		options.tabs = [
			{
				navSelector: ".nav-tabs",
				contentSelector: ".content",
				initial: "0",
			},
		]

		super(options)

		this.calculator = createDamageCalculator(roll, target, game.i18n.format.bind(game.i18n))
	}

	private calculator: IDamageCalculator

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
		const books = game.settings.get(SYSTEM_NAME, SETTINGS.BASE_BOOKS)

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

		const intValue = parseInt(target.value)
		const floatValue = parseFloat(target.value)
		const index = parseInt(target.dataset.index)
		const locationDamage = this.calculator.hits[index]

		switch (target.dataset.action) {
			case "location-select":
				locationDamage.locationIdOverride = target.value
				break

			case "hardened-select":
				// this.calculator.hardenedDROverride = target.value
				break

			case "override-dr":
				locationDamage.damageResistanceOverride = isNaN(intValue) ? undefined : intValue
				break

			case "override-basic":
				locationDamage.basicDamageOverride = isNaN(intValue) ? undefined : intValue
				break

			case "armordivisor-select":
				this.calculator.armorDivisorOverride = isNaN(floatValue) ? undefined : floatValue
				break

			case "damagetype-select":
				this.calculator.damageTypeOverride = target.value
				break

			case "damagepool-select":
				this.calculator.damagePoolOverride = target.value
				break

			case "override-woundingmod":
				locationDamage.woundingModifierOverride = isNaN(floatValue) ? undefined : floatValue
				break

			case "override-vulnerability":
				this.calculator.vulnerabilityOverride = isNaN(intValue) ? undefined : intValue
				break

			case "tolerance-select":
				this.calculator.injuryToleranceOverride = target.value
				break

			case "override-reduction":
				this.calculator.damageReductionOverride = isNaN(floatValue) ? undefined : floatValue
				break

			case "override-range":
				this.calculator.rangeOverride = isNaN(intValue) ? undefined : intValue
				break

			case "override-rofMultiplier":
				this.calculator.rofMultiplierOverride = isNaN(intValue) ? undefined : intValue
				break
		}

		this.render(true)
	}

	async _onApplyControlClick(event: JQuery.ClickEvent, target: any): Promise<void> {
		event.preventDefault()

		const intValue = parseInt(target.value)
		const floatValue = parseFloat(target.value)
		const index = parseInt(target.dataset.index)
		const locationDamage = this.calculator.hits[index]

		switch (target.dataset.action) {
			case "location-random":
				locationDamage.locationIdOverride = await this._rollRandomLocation()
				break

			case "location-flexible":
				locationDamage.flexibleArmorOverride = target.checked
				break

			case "apply-basic":
				this.calculator.applyBasicDamage(intValue)
				break

			case "apply-injury":
				this.calculator.applyTotalDamage()
				break

			case "reset-form":
				this.calculator.resetOverrides()
				break

			case "apply-vulnerability":
				this.calculator.applyVulnerability(intValue, target.checked)
				break

			case "override-isExplosion":
				this.calculator.isExplosionOverride = target.checked
				break

			case "override-internal":
				this.calculator.isInternalOverride = target.checked
				break

			case "override-isHalfDamage":
				this.calculator.isHalfDamageOverride = target.checked
				break

			case "override-isShotgunCloseRange":
				this.calculator.isShotgunCloseRangeOverride = target.checked
				break
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
		}
	}

	private get damageTypeChoice(): Record<string, string> {
		let results: Record<string, string> = {}
		Object.entries(DamageTypes).map(e => (results[e[0]] = e[1].full_name))
		return results
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
