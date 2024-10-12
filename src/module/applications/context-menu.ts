class ContextMenuGURPS extends ContextMenu {
	override _setPosition([html]: JQuery, [target]: JQuery): void {
		document.body.appendChild(html)
		const { clientWidth, clientHeight } = document.documentElement
		const { width, height } = html.getBoundingClientRect()

		const { clientX, clientY } = window.event as unknown as { clientX: number; clientY: number }
		const left = Math.min(clientX, clientWidth - width)
		this._expandUp = clientY + height > clientHeight
		html.classList.add("gurps")
		html.classList.toggle("expand-up", this._expandUp)
		html.classList.toggle("expand-down", !this._expandUp)
		html.style.visibility = ""
		html.style.left = `${left}px`
		if (this._expandUp) html.style.bottom = `${clientHeight - clientY}px`
		else html.style.top = `${clientY}px`
		target.classList.add("context")
		// const theme = (target.closest("[data-theme]") as HTMLElement)?.dataset.theme ?? ""
		// setTheme(html, theme)
	}
}

export { ContextMenuGURPS }
