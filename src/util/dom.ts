export function parents(el: any | null, selector: string) {
	const parents = []
	while ((el = el.parentNode) && el !== document) {
		if (!selector || el?.matches(selector)) parents.push(el)
	}
	return parents
}
