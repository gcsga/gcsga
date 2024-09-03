import { ErrorGURPS } from "./misc.ts"
import { StringBuilder } from "./string-builder.ts"

export namespace Int {
	export const DP = 4

	function multiplier(decimalPoints = DP): number {
		return 10 ** decimalPoints
	}

	function maxDecimalDigits(decimalPoints = DP): number {
		return decimalPoints
	}

	export function from(value: number): number {
		return Math.round(value * multiplier()) / multiplier()
	}

	export function fromString(str: string): [number, Error | null] {
		if (str === "") {
			return [0, ErrorGURPS("Empty string is not valid")]
		}
		str = str.replaceAll(",", "")
		if (str.includes("E") || str.includes("e")) {
			// Given a floating-point str with an exponent, which technically
			// isn't valid input, but we'll try to convert it anyway.
			try {
				const f = Number(str.match(/\d+[eE][+-]?\d+/)![0] ?? "")
				if (isNaN(f)) return [0, ErrorGURPS(`${f} is not a number`)]
				return [f, null]
			} catch (error) {
				if (error instanceof Error) return [0, error]
				console.log(error)
				return [0, null]
			}
		}
		const mult = multiplier()
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
			default: {
				value = parseInt(parts[0])
				if (isNaN(value)) {
					return [0, ErrorGURPS(`${parts[0]} is not a number.`)]
				}
				if (value < 0) {
					neg = true
					value = -value
				}
				value *= mult
			}
		}
		if (parts.length > 1) {
			const cutoff = 1 + maxDecimalDigits()
			const buffer = new StringBuilder()
			buffer.push("1")
			buffer.push(parts[1])
			while (buffer.length < cutoff) {
				buffer.push("0")
			}
			let frac = buffer.toString()
			if (frac.length > cutoff) {
				frac = frac.slice(0, cutoff)
			}
			fraction = parseInt(frac)
			if (isNaN(fraction)) {
				return [0, ErrorGURPS(`${frac} is not a number.`)]
			}
			value += fraction - mult
		}
		if (neg) value = -value
		return [value / mult, null]
		// return [value, null]
	}

	export function fromStringForced(input: string): number {
		const [f] = fromString(input)
		return f
	}

	export function extract(input: string): [value: number, remainder: string] {
		let last = 0
		const maximum = input.length
		if (last < maximum && input[last] === " ") {
			last += 1
		}
		if (last >= maximum) {
			return [0, input]
		}
		let ch = input[last]
		let found = false
		let decimal = false
		const start = last
		while (
			(start === last && (ch === "-" || ch === "+")) ||
			ch === "," ||
			(!decimal && ch === ".") ||
			(ch >= "0" && ch <= "9")
		) {
			if (ch >= "0" && ch <= "9") found = true
			if (ch === ".") decimal = true
			last += 1
			if (last >= maximum) break
			ch = input[last]
		}
		if (!found) {
			return [0, input]
		}
		const [value, error] = fromString(input.slice(start, last))
		if (error !== null) {
			return [0, input]
		}
		return [value, input.slice(last)]
	}
}
