import { SYSTEM_NAME } from "@data"
import { ActorDirectoryGURPS } from "@module/apps/sidebar/actor-directory.ts"
import { ChatLogGURPS } from "@module/apps/sidebar/chat-log.ts"
import { CombatTrackerGURPS } from "@module/apps/sidebar/combat-tracker.ts"
import { CompendiumDirectoryGURPS } from "@module/apps/sidebar/compendium-directory.ts"
import { ItemDirectoryGURPS } from "@module/apps/sidebar/item-directory.ts"
import { RulerGURPS } from "@module/canvas/ruler/document.ts"
import { TokenGURPS } from "@module/canvas/token/index.ts"
import * as SpeedProviderGURPS from "@module/modules/drag-ruler.ts"
import { RollGURPS } from "@module/roll/index.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { registerHandlebarsHelpers } from "@scripts/handlebars.ts"
import { registerFonts } from "@scripts/register-fonts.ts"
import { registerTemplates } from "@scripts/register-templates.ts"
import { SetGameGURPS } from "@scripts/set-game-gurps.ts"
import { registerSettings } from "@system/settings/index.ts"

const LEGAL =
	"GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games.\nAll rights are reserved by Steve Jackson Games.\nThis game aid is the original creation of Mikolaj Tomczynski and is released for free distribution, and not for resale, under the permissions granted by\nhttp://www.sjgames.com/general/online_policy.html"

const BANNER = `
      .:~!!~:.        ...::  .:..:.   :..::::::.       .:..:::::..        :~7??!^.
    ?#@@&##&@@#J.     5@@&!  :&@@&.  .B@@@&##&@@@#7    ^&@@&#&&&@@&Y   :G@@@&&&@@@#J.
  ~&@@Y.     J@@7    ^@@P     G@@Y    7@@&     ^&@@5    B@@?    ^#@@# .@@@J     :@@@!
 ^@@@^              :@@B      G@@5    7@@#      J@@B    B@@?     ~@@@.:@@@#7^.   ^!
 B@@B       :^::^   &@@:      G@@5    7@@&~~~~!P@@#.    B@@?    ^&@@5  7&@@@@@@&BY~.
 G@@#       :&@@B  ^@@&       G@@5    7@@@#B&@@@5.      B@@J.~5&@@B^     .^?5B&@@@@@5
 :@@@7       G@@Y  :@@@:      G@@P    7@@&   P@@&:      B@@@&#P?^               .B@@@^
  ^&@@P.     G@@Y   Y@@&~     G@@5    7@@#    J@@@!     B@@J          P@@@.      5@@@:
    7#@@&P?!~&@@G    !&@@@#GPP@@@#    5@@@.    !@@@P.  .&@@Y          .5@@@B5JYG@@@&~
      .^?5GBBBGG5.     .~?JYY5YJJJ^  .JJJJ~     :JJY7  ~JJJJ.           .~YB#&&BP7:
                                                                                       `

export const Init = {
	listen: (): void => {
		Hooks.once("init", () => {
			console.log(`${SYSTEM_NAME} | Initializing ${SYSTEM_NAME}`)
			console.log(`%c${BANNER}`, "color:limegreen")
			console.log(`%c${LEGAL}`, "color:yellow")

			const src = `systems/${SYSTEM_NAME}/assets/gurps4e.svg`
			$("#logo").attr("src", src)

			CONFIG.GURPS = GURPSCONFIG

			CONFIG.Token.objectClass = TokenGURPS
			CONFIG.statusEffects = Object.entries(CONFIG.GURPS.statusEffects.conditions).map(([id, name]) => ({
				id,
				name,
				img: `systems/${SYSTEM_NAME}/assets/status/${id}.webp` as const,
			}))
			CONFIG.Canvas.rulerClass = RulerGURPS

			CONFIG.ui.chat = ChatLogGURPS
			CONFIG.ui.combat = CombatTrackerGURPS
			CONFIG.ui.actors = ActorDirectoryGURPS
			CONFIG.ui.items = ItemDirectoryGURPS
			CONFIG.ui.compendium = CompendiumDirectoryGURPS

			CONFIG.Dice.rolls.unshift(RollGURPS)

			SpeedProviderGURPS.init()

			registerFonts()
			registerHandlebarsHelpers()
			registerSettings()
			registerTemplates()

			SetGameGURPS.onInit()
		})
	},
}
