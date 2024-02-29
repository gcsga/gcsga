export const EvalEmbeddedRegex = /\|\|[^|]+\|\|/g
export const NewLineRegex = /(?:\n|<br>)/g

// export function replaceAllStringFunc(re: RegExp, src: string, repl: (s: string) => string): string {
export function replaceAllStringFunc(
	re: RegExp,
	src: string,
	repl: { embeddedEval: (s: string) => string } | null,
): string {
	if (!repl) return src
	const b = src.replace(re, function (s) {
		return repl.embeddedEval(s)
	})
	return b
}
