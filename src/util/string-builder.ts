export class StringBuilder {
	buffer: string[]

	constructor() {
		this.buffer = []
	}

	push(...args: string[]): number {
		return this.buffer.push(...args)
	}

	toString(): string {
		return this.buffer.join("") ?? ""
	}

	get length(): number {
		return this.buffer.length
	}

	appendToNewLine(str: string): number {
		if (str === "") return this.length
		if (this.length !== 0) this.push("<br>")
		this.push(str)
		return this.length
	}
}
