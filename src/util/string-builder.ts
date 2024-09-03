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

	// Returns the length of the buffer as a string
	get length(): number {
		return this.toString().length
	}

	// Returns the number of items in the buffer
	get size(): number {
		return this.buffer.length
	}

	appendToNewLine(str: string): number {
		if (str === "") return this.size
		if (this.size !== 0) this.push("<br>")
		this.push(str)
		return this.size
	}
}
