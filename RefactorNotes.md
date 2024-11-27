# Refactor Notes

## Bugs

- Re-think attribute holder template, account for resource trackers and move types
- Add "max" and "min" to thresholds \* DONE
- add progress bar to pool bars.
- source data retains unused replacement values
- Changing default hit locations requires reload before taking effecct

## Current Tasks

- Implement ActionSheet
  - Implement dragdrop

## Left To Do

- Chat Messages \*5
  - Re-do roll message templates and damage message handling
  - Move @module/util/chat.ts functionality to Chat Message
- Settings \*1
  - Re-do menus \*1
    - Attribute Effects \*1
  - Re-add old settings \*2
- Item
- Actor
  - Legacy Support?
- Item Sheet \* CURRENT
  - Description \* CURRENT
- Effect Sheet \* CURRENT
  - Effect \* DONE
  - Roll Modifiers \* DONE
  - Description \* CURRENT
- Actor Sheet \*2
  - Collapsible sidebar
    - Option to hide attributes if not frequently used to decrease clutter?
    - Pinned items
  - DND5e context menu
  - Traits Tab.
    - Add fields for species, cultural familiarity, language, separate to own tables
- Token
- Token Document
- Combat
- Combatant
- Active Effect
  - Add "consumable" toggle, quantity, cooldown?, duration in hours? (for luck?)
- Modifier Bucket
  - Implement Fuzzy Search
  - Data Models
- Conditions (from compendium ?) showing in token status
- Quench tests
- Active Effects (& Activities?)
  - Needs consultation
  - Add Effects Tab to Item Sheet
  - Add Effect Sheet
  - Add Effect system fields

## Done

- Item
  - Add field label values for all fields
- Roll Handlers
  - Fix old functions
- Change #clean for #cleanData
- Change Schema Fields to Embedded Data Fields where appropriate
- Item Sheet
  - Replacements Tab
    - Toggle for showing replacements instead of placeholders (optional)
    - In non-edit mode, show replacements instead of substitutions maybe with indicating color background
  - Embeds Tab
  - Header color dependent on item type page color in GURPS Basic Set
  - Prereqs
  - Features
  - Defaults
  - Equipment
  - Equipment Container
  - Trait
  - Trait Container
  - Skill
  - Skill Container
  - Spell
  - Spell Container
  - RPM Spell
  - Technique
  - Note
  - Note Container
  - Melee Weapon
  - Ranged Weapon
- Settings
  - Re-do menus
    - Colors
    - Attributes
    - Resource Trackers
    - Move Types
    - Sheet Settings
    - Hit Locations:

## Notes

- Save last added prereq/feature as in GCS
