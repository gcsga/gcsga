import { ErrorGURPS } from "./misc.ts"
import { StringBuilder } from "./string-builder.ts"

const FourDecimalPlaces = 4

export class Int {
	static from(n: number, DP = FourDecimalPlaces): number {
		return Math.round(n * 10 ** DP) / 10 ** DP
	}

	static fromStringForced(str: string): number {
		const [value, error] = Int.fromString(str)
		if (error) return 0
		return value
	}

	static fromString(str: string): [number, Error | null] {
		if (str === "") return [0, ErrorGURPS("Empty string is not valid")]
		str = str.replaceAll(",", "")
		if (str.match(/[eE]/)) {
			try {
				const f = parseFloat(str)
				return [f, null]
			} catch (err) {
				if (err instanceof Error) return [0, err]
			}
		}
		const parts = str.split(".", 2)
		let [value, fraction] = [0, 0]
		let neg = false
		switch (parts[0]) {
			case "":
				break
			case "-":
			case "-0":
				neg = true
				break
			default:
				value = parseInt(parts[0])
				if (isNaN(value)) {
					return [0, ErrorGURPS(`${value} is not a number`)]
				}
				if (value < 0) neg = true
				value = -value
		}
		if (parts.length > 0) {
			const cutoff = 1 + FourDecimalPlaces
			const buffer = new StringBuilder()
			buffer.push("1")
			buffer.push(parts[1])
			while (buffer.toString().length < cutoff) {
				buffer.push("0")
			}
			let frac = buffer.toString()
			if (frac.length > cutoff) frac = frac.substring(0, cutoff)
			fraction = parseInt(frac)
			if (isNaN(fraction)) return [0, ErrorGURPS(`${fraction} is not a number`)]
			value += fraction
		}
		if (neg) value = -value
		return [value, null]
		// str = str.match(/-?[\d.Ee+]+/) ? str.match(/-?[\d.Ee]+/)![0] : "0"
		// return Int.from(parseFloat(str))
	}

	static extract(str: string): [number, string] {
		// const num = Int.fromString(str)
		// str = str.replace(`${num}`, "")
		// return [num, str]
		let last = 0
		const maximum = str.length
		if (last < maximum && str[last] === " ") last += 1
		if (last >= maximum) return [0, str]
		let ch = str[last]
		let found = false
		let decimal = false
		const start = last
		while ((start === last && (ch === "-" || ch === "+")) || (!decimal && ch === ".") || ch.match(/[0-9]/)) {
			if (ch.match(/[0-9]/)) found = true
			if (ch === ".") decimal = true
			last += 1
			if (last >= maximum) break
			ch = str[last]
		}
		if (!found) return [0, str]
		const [num, _] = Int.fromString(str.slice(start, last))
		if (isNaN(num)) return [0, str]
		return [num, str.slice(last)]
	}
}
export class Fraction {
	numerator: number

	denominator: number

	constructor(numerator: number, denominator: number) {
		this.numerator = numerator
		this.denominator = denominator
	}

	static new(str: string): Fraction {
		const parts = str.split("/")
		const f = new Fraction(Int.fromStringForced(parts[0]), Int.from(1))
		if (parts.length > 1) f.denominator = Int.fromStringForced(parts[1])
		return f
	}

	private normalize(): void {
		if (this.denominator === 0) {
			this.numerator = 0
			this.denominator = Int.from(1)
		} else if (this.denominator < 0) {
			const negOne = Int.from(-1)
			this.numerator *= negOne
			this.denominator *= negOne
		}
	}

	toString(): string {
		this.normalize()
		if (this.denominator === 1) return `${this.numerator}`
		return `${this.numerator}/${this.denominator}`
	}

	signedString(): string {
		this.normalize()
		const s = this.numerator.signedString()
		if (this.denominator === 1) return s
		return `${s}/${this.denominator}`
	}

	get value(): number {
		this.normalize()
		return this.numerator / this.denominator
	}
}
