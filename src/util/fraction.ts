import { Int } from "./int.ts"

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

	normalize(): void {
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
