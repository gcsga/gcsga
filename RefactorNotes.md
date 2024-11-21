# Refactor Notes

## Bugs

- source data retains unused replacement values

## Current Tasks

- Implement ActionSheet
  - Implement update action
- Fix Actor#meleeWeapons and Actor#rangedWeapons for gcs/functions
- Change reference to updateAction and deleteAction to system data functions and actually implement them.
- Change actions from array to map/embedded collection
- Create activity
- Move attacks to activity (reasoning: they don't need to be items and don't directly go on a character, and can't contain other items)
- Activity Types
  - Melee Weapon
  - Ranged Weapon
  - Utility (temporary status effects)
  - Healing

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
