import { Quench } from "@ethaks/fvtt-quench"
import { registerQuenchBatches } from "@module/quench/index.ts"

export const QuenchReady = {
	listen: (): void => {
		Hooks.on("quenchReady", (quench: Quench) => {
			registerQuenchBatches(quench)
		})
	},
}
