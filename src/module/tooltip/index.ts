export class TooltipGURPS {
	list: Array<string | TooltipGURPS> = []

	unshift(...args: Array<string | TooltipGURPS>): number {
		for (const a of args) {
			this.list.unshift(a)
		}
		return this.list.length
	}

	push(...args: Array<string | TooltipGURPS>): number {
		for (const a of args) {
			this.list.push(a)
		}
		return this.list.length
	}

	includes(searchElement: string | TooltipGURPS, fromIndex?: number): boolean {
		for (const one of this.list) {
			if (one instanceof TooltipGURPS && one.includes(searchElement, fromIndex)) return true
		}
		return this.list.includes(searchElement, fromIndex)
	}

	toString(nl = "<br>", tab = 1): string {
		let final = ""
		for (const i of this.list) {
			if (i instanceof TooltipGURPS) final += i.toString(nl, tab + 1) + nl
			else final += i
		}
		return "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(tab) + final
	}

	get length(): number {
		return this.list.length
	}

	get string(): string {
		return this.toString()
	}

	replaceAll(searchValue: string | RegExp, replaceValue: string): TooltipGURPS {
		const tooltip = new TooltipGURPS()
		for (const one of this.list) {
			tooltip.push(one.replaceAll(searchValue, replaceValue))
		}
		return tooltip
	}
}
