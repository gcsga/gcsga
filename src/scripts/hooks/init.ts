import { ActorProxyGURPS } from "@actor"
import { SYSTEM_NAME } from "@data"
import { ItemProxyGURPS } from "@item"
import { StatusEffectsGURPS } from "@item/condition/list.ts"
import { ActiveEffectGURPS } from "@module/active-effect/index.ts"
import { TokenGURPS } from "@module/canvas/token/index.ts"
import { CombatGURPS } from "@module/combat/document.ts"
import { CombatantGURPS } from "@module/combatant/document.ts"
import { JournalEntryGURPS } from "@module/journal-entry/document.ts"
import { JournalEntryPageProxyGURPS } from "@module/journal-entry/page/document.ts"
import * as SpeedProviderGURPS from "@module/modules/drag_ruler.ts"
import { RollGURPS } from "@module/roll/index.ts"
import { RulerGURPS } from "@module/ruler/document.ts"
import { registerSettings } from "@module/settings/index.ts"
import { UserGURPS } from "@module/user/index.ts"
import { TokenDocumentGURPS } from "@scene/token-document/index.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { registerFonts } from "@scripts/register-fonts.ts"
import { registerTemplates } from "@scripts/register-templates.ts"
import { CombatTrackerGURPS, ItemDirectoryGURPS } from "@ui"
import { registerHandlebarsHelpers } from "@util/handlebars_helpers.ts"

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

			// Assign custom classes and constants hereby
			CONFIG.User.documentClass = UserGURPS
			CONFIG.Item.documentClass = ItemProxyGURPS
			CONFIG.Actor.documentClass = ActorProxyGURPS
			CONFIG.ActiveEffect.documentClass = ActiveEffectGURPS
			CONFIG.Combat.documentClass = CombatGURPS
			CONFIG.Combatant.documentClass = CombatantGURPS

			CONFIG.JournalEntry.documentClass = JournalEntryGURPS
			CONFIG.JournalEntryPage.documentClass = JournalEntryPageProxyGURPS

			CONFIG.Token.documentClass = TokenDocumentGURPS
			CONFIG.Token.objectClass = TokenGURPS

			CONFIG.statusEffects = StatusEffectsGURPS
			CONFIG.Canvas.rulerClass = RulerGURPS

			CONFIG.ui.combat = CombatTrackerGURPS
			CONFIG.ui.items = ItemDirectoryGURPS

			CONFIG.Dice.rolls.unshift(RollGURPS)

			// StaticHitLocation.init()
			SpeedProviderGURPS.init()

			registerFonts()
			registerHandlebarsHelpers()
			registerSettings()
			registerTemplates()
		})
	},
}
