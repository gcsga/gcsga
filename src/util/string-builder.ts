import { MaybePromise } from "@module/data/types.ts"

export class StringBuilder {
	buffer: MaybePromise<string>[]

	constructor() {
		this.buffer = []
	}

	push(...args: MaybePromise<string>[]): number {
		return this.buffer.push(...args)
	}

	toString(): string {
		return this.buffer.join("") ?? ""
	}

	// Returns the length of the buffer as a string
	get length(): number {
		return this.buffer.length
	}

	// Returns the number of items in the buffer
	get size(): number {
		return this.buffer.length
	}

	appendToNewLine(str: MaybePromise<string>): number {
		if (str === "") return this.size
		if (this.size !== 0) this.push("<br>")
		this.push(str)
		return this.size
	}
}
