import { StringBuilder } from "@util/string_builder"

export class ConditionalModifier {
	from: string

	amounts: number[]

	sources: string[]

	constructor(source: string, from: string, amount: number) {
		this.from = from
		this.amounts = [amount]
		this.sources = [source]
	}

	add(source: string, amount: number): void {
		this.amounts.push(amount)
		this.sources.push(source)
	}

	get total(): number {
		return this.amounts.reduce((partialSum, a) => partialSum + a, 0)
	}

	get tooltip(): string {
		const buffer = new StringBuilder()
		this.sources.forEach((value, index) => {
			if (buffer.length !== 0) buffer.push("<br>")
			buffer.push(`${this.amounts[index].signedString()} ${value}`)
		})
		return buffer.toString()
	}
}
