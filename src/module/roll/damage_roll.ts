import { DiceGURPS } from "@module/dice"
import { Evaluated } from "types/foundry/client/dice/roll"

export const DamageRegEx =
	// eslint-disable-next-line max-len
	/^(?<amount>(?<roll>(?<dice>\d+)d(?<sides>\d+)?|(?<flat>\d+))((?<sign>[+\-–])(?<adds>\d+))?(?<mult>[×*x]\d+)?)\s*(?<divisor>\(\d+(\.\d+)?\))?\s*(?<type>burn|cor|cr|ctrl|cut|dmg|fat|imp|injury|pi\+\+|pi\+|pi|pi-|toxic|tox|kbo|)\s*(?<ex>\w+?)?$/

export class DamageRollGURPS {
	dieRoll: DiceGURPS | undefined

	flatDamage: number | undefined

	readonly text: string

	readonly groups: { [key: string]: string }

	readonly roll: Roll

	private _evaluatedRoll: Evaluated<Roll> | undefined

	constructor(text: string) {
		// console.log(text)
		const groups = text.match(DamageRegEx)?.groups
		if (!groups) throw new Error("Bad damage term")
		this.text = text
		this.groups = groups
		this.roll = new Roll(this.rollFormula)
	}

	get dice(): DiceGURPS {
		return new DiceGURPS(this.rollFormula)
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

	get damageType(): string {
		return this.groups.type
	}

	get damageModifier(): string {
		return this.groups.ex
	}

	get total(): number | undefined {
		return this.roll.total
	}

	async evaluate() {
		this._evaluatedRoll = await this.roll.evaluate({ async: true })
	}

	async getTooltip(): Promise<unknown> {
		return await this._evaluatedRoll!.getTooltip()
	}

	get stringified(): string {
		return JSON.stringify(this._evaluatedRoll!)
	}
}
