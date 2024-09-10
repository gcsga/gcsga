export class TooltipGURPS {
	buffer: (string | TooltipGURPS)[] = []

	unshift(...args: (string | TooltipGURPS)[]): number {
		for (const a of args) {
			this.buffer.unshift(a)
		}
		return this.buffer.length
	}

	push(...args: (string | TooltipGURPS)[]): number {
		for (const a of args) {
			this.buffer.push(a)
		}
		return this.buffer.length
	}

	includes(searchElement: string | TooltipGURPS, fromIndex?: number): boolean {
		for (const one of this.buffer) {
			if (one instanceof TooltipGURPS && one.includes(searchElement, fromIndex)) return true
		}
		return this.buffer.includes(searchElement, fromIndex)
	}

	toString(nl = "<br>", tab = 0): string {
		if (this.buffer.length === 0) return ""
		let final = ""
		for (const i of this.buffer) {
			if (i instanceof TooltipGURPS) final += i.toString(nl, tab + 1) + nl
			else final += i
		}
		return final.replace(/(?:\n|<br>)/g, nl)
	}

	// Returns the length of the buffer as a string
	get length(): number {
		return this.toString().length
	}

	// Returns the number of items in the buffer
	get size(): number {
		return this.buffer.length
	}

	get string(): string {
		return this.toString()
	}

	replaceAll(searchValue: string | RegExp, replaceValue: string): TooltipGURPS {
		const tooltip = new TooltipGURPS()
		for (const one of this.buffer) {
			tooltip.push(one.replaceAll(searchValue, replaceValue))
		}
		return tooltip
	}

	appendToNewLine(str: string): number {
		if (str === "") return this.size
		if (this.size !== 0) this.push("<br>")
		this.push(str)
		return this.size
	}
}
