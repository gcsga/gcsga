import { DAMAGE_TYPE } from "@module/apps/damage-calculator/damage-type.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { ErrorGURPS } from "@util"

export const DamageRegEx =
	// eslint-disable-next-line max-len
	/^(?<amount>(?<roll>(?<dice>\d+)d(?<sides>\d+)?|(?<flat>\d+))((?<sign>[+\-–])(?<adds>\d+))?(?<mult>[×*x]\d+)?)\s*(?<divisor>\(\d+(\.\d+)?\))?\s*(?<type>burn|cor|cr|ctrl|cut|dmg|fat|imp|injury|pi\+\+|pi\+|pi|pi-|toxic|tox|kbo|)\s*(?<ex>\w+?)?$/

export class DamageRollGURPS {
	dieRoll: DiceGURPS | undefined

	flatDamage: number | undefined

	readonly text: string

	// readonly groups: { type: DAMAGE_TYPE; [key: string]: string }
	readonly groups: { [key: string]: string }

	// Lazily evaluated to allow testing of this class outside of Foundry.
	private _roll: Roll | undefined = undefined

	private _evaluatedRoll?: Rolled<Roll>

	constructor(text: string) {
		const groups = text.match(DamageRegEx)?.groups
		if (!groups) throw ErrorGURPS("Bad damage term")
		this.text = text
		this.groups = groups
	}

	get dice(): DiceGURPS {
		return new DiceGURPS(this.rollFormula)
	}

	get roll(): Roll {
		if (!this._roll) this._roll = new Roll(this.rollFormula)
		return this._roll
	}

	get rollFormula(): string {
		// Let result = this.groups.flat ?? `${this.groups.dice}d${this.groups.sides ?? "6"}`
		let result = this.groups.flat ?? `${this.groups.dice}d${this.groups.sides ?? "6"}`
		result += this.groups.sign
			? `${this.groups.sign.replace(String.fromCharCode(8211), "-")}${this.groups.adds}`
			: ""
		result += this.groups.mult ? `${this.groups.mult.replace("×", "*").replace("x", "*")}` : ""
		return result
	}

	get displayString(): string {
		let result =
			this.groups.flat ?? `${this.groups.dice}d${this.groups.sides === "6" ? "" : this.groups.sides ?? ""}`
		result += this.groups.sign
			? `${this.groups.sign.replace("-", String.fromCharCode(8211))}${this.groups.adds}`
			: ""
		result += this.groups.mult ? `${this.groups.mult.replace("*", "×").replace("x", "×")}` : ""

		return [result, this.groups.divisor, this.groups.type, this.groups.ex].filter(it => !!it).join(" ")
	}

	get armorDivisor(): string {
		return this.groups.divisor
	}

	get armorDivisorAsInt(): number {
		return this.armorDivisor ? parseFloat(this.armorDivisor.replace(/\((\d+(\.\d+)?)\)/, "$1")) : 1
	}

	get damageType(): DAMAGE_TYPE {
		return this.groups.type as DAMAGE_TYPE
	}

	get damageModifier(): string {
		return this.groups.ex
	}

	get total(): number | undefined {
		if (!this._roll) this._roll = new Roll(this.rollFormula)

		return this._roll.total
	}

	async evaluate(): Promise<void> {
		if (!this._roll) this._roll = new Roll(this.rollFormula)
		// this._evaluatedRoll = await this._roll.evaluate({ async: true })
		this._evaluatedRoll = await this._roll.evaluate()
	}

	async getTooltip(): Promise<string> {
		return await this._evaluatedRoll!.getTooltip()
	}

	get stringified(): string {
		return JSON.stringify(this._evaluatedRoll!)
	}
}
