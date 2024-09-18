# Refactor Notes

## Left To Do

- Weapon Fields
  - Change #clean for #cleanData
- Change Schema Fields to Embedded Data Fields where appropriate \*0 _MOST IMPORTANT_
- Chat Messages \*5
  - Re-do roll message templates and damage message handling
  - Move @module/util/chat.ts functionality to Chat Message
- Settings \*1
  - Re-do menus \*1
    - Colors \*DONE
    - Attributes \*2
    - Resource Trackers \*3
    - Move Types \*4
    - Sheet Settings \*DONE
  - Re-add old settings \*2
- CellData
  - Condition
- Item \*3
  - Add field label values for all fields
- Actor
  - Legacy Support?
- Item Sheet \*4
- Actor Sheet \*2
  - Collapsible sidebar
  - DND5e context menu
- Token
- Token Document
- Combat
- Combatant
- Active Effect
- Modifier Bucket
  - Implement Fuzzy Search
  - Data Models
- Conditions (from compendium ?) showing in token status
- Quench tests

## Done

- Roll Handlers
  - Fix old functions

## Current Task Notes

- Currently adding an item necessitates submitting the form but this is not ideal. Would be better to re-render the form (or just the part) with the new data but not submit yet. Research how to do this.
