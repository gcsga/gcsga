import fields = foundry.data.fields

const negative = ["-", "–"] // Include the minus sign as well as dash.
const times = ["x", "×"] // Include the times sign as well as 'x'.

class DiceGURPS extends foundry.abstract.DataModel<foundry.abstract.DataModel, DiceSchema> {
	static override defineSchema(): DiceSchema {
		const fields = foundry.data.fields
		return {
			sides: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			count: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			modifier: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			multiplier: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
		}
	}

	static fromString(str: string): DiceGURPS {
		str = str.trim()
		let dice = new DiceGURPS()
		let i = 0
		let ch: string
		;[dice.count, i] = extractValue(str, 0)
		const hadCount = i !== 0
		;[ch, i] = nextChar(str, i)
		let hadSides = false
		let hadD = false
		if (ch.toLowerCase() === "d") {
			hadD = true
			const j = i
			;[dice.sides, i] = extractValue(str, i)
			hadSides = i !== j
			;[ch, i] = nextChar(str, i)
		}
		if (hadSides && !hadCount) dice.count = 1
		else if (hadD && !hadSides && hadCount) dice.sides = 6

		if (["+", ...negative].includes(ch)) {
			const neg = negative.includes(ch)
			;[dice.modifier, i] = extractValue(str, i)
			if (neg) dice.modifier = -dice.modifier
			;[ch, i] = nextChar(str, i)
		}

		if (!hadD) {
			dice.modifier ??= 0
			dice.modifier += dice.count
			dice.count = 0
		}

		if (times.includes(ch.toLowerCase())) [dice.multiplier] = extractValue(str, i)

		if (dice.multiplier === 0) dice.multiplier = 1

		dice.clean()
		return dice
	}

	clean(): void {
		if (this.count < 0) this.count = 0
		if (this.sides < 0) this.sides = 0
		if (this.multiplier < 1) this.multiplier = 1
	}

	override toString(keepSix: boolean): string {
		let str = ""
		str += this.count
		str += "d"
		if (this.sides !== 6 || keepSix) str += this.sides
		if (this.modifier) {
			str += this.modifier > 0 ? "+" : "-"
			str += Math.abs(this.modifier)
		}
		if (this.multiplier !== 1) str += `×${this.multiplier}`
		return str
	}
}

function extractValue(str: string, i: number): [number, number] {
	let value = 0
	while (i < str.length) {
		const ch = str[i]
		if (!ch.match("[0-9]")) return [value, i]
		value *= 10
		value += parseInt(ch)
		i += 1
	}
	return [value, i]
}

function nextChar(str: string, i: number): [string, number] {
	if (i < str.length) return [str[i], i + 1]
	return ["", i]
}

interface DiceGURPS
	extends foundry.abstract.DataModel<foundry.abstract.DataModel, DiceSchema>,
		ModelPropsFromSchema<DiceSchema> {}

type DiceSchema = {
	sides: fields.NumberField<number, number, true, false, true>
	count: fields.NumberField<number, number, true, false, true>
	modifier: fields.NumberField<number, number, true, false, true>
	multiplier: fields.NumberField<number, number, true, false, true>
}

export { DiceGURPS, type DiceSchema }
