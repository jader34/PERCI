---
name: Percival D&D 5E - Blood Oath Sheet
description: Gothic dark fantasy interface for tabletop D&D 5E combat & character management
colors:
  primary: "#990000"
  primary-highlight: "#ef4444"
  gold: "#f59e0b"
  gold-light: "#fcd34d"
  background: "#05070a"
  neutral-fg: "#f1f5f9"
  shadow-color: "rgba(0, 0, 0, 0.37)"
  surface-glass: "rgba(255, 255, 255, 0.05)"
  border-glass: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontWeight: 700
  body:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "Fira Code, monospace"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
components:
  nav-item:
    height: "46px"
  touch-button:
    height: "38px"
---

# Design System

## Overview
Design system for Percival, O Triturador (Paladino 5E do Juramento de Sangue). Crafted with a dark gothic fantasy palette, frosted glassmorphism overlays, high-contrast blood crimson accents, and ergonomics tuned for one-handed mobile play.

## Colors
- **Deep Obsidian Background (`#05070a`)**: The darkness of a cursed battlefield.
- **Blood Crimson (`#990000`) & Light Crimson (`#ef4444`)**: Used for hit points, divine smite triggers, danger states, and active tabs.
- **Amber Gold (`#f59e0b` / `#fcd34d`)**: Used for hero accents, spell slots, saving throw proficiencies, and coin balances.
- **Frosted Glass (`rgba(255, 255, 255, 0.05)`)**: Semi-transparent card layers with 12px blur backdrop filtering.

## Typography
- **Display**: `Cinzel` for hero headings, character identity, and section titles.
- **Body UI**: `Outfit` for effortless legibility under varying ambient lighting conditions.
- **Numbers & Modifiers**: `Fira Code` with `tabular-nums` lining enabled, preventing horizontal jitter during dice rolls and HP modifications.

## Layout & Mobile Ergonomics
- **Safe Areas**: Top and bottom insets dynamically adjust for notches, Dynamic Island, and system gesture bars.
- **Dynamic Viewport (`100dvh`)**: Locks full height to the visible screen, preventing browser address bar push-down jumps.
- **Thumbs-First Target Areas**: Interactive controls maintain a minimum of 36px to 46px height with `touch-action: manipulation` to eliminate the 300ms mobile tap delay.

## Elevation & Depth
- Ambient soft dark shadows (`box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`).
- Glowing active state highlights (`drop-shadow` and subtle animated pulse on active buffs and available spell slots).

## Shapes
- Modern rounded aesthetic with `rounded-2xl` (16px) for cards and `rounded-xl` (12px) for buttons, providing a tactile, organic handheld feel.

## Do's and Don'ts
- **DO**: Use tinted secondary text (e.g. `text-rose-200`, `text-amber-950`) over colored backgrounds rather than washed-out neutral gray.
- **DO**: Keep action buttons large enough for thumbs in quick tabletop turns.
- **DON'T**: Reintroduce generic purple-to-blue AI gradients. Stick to the curated Blood & Iron palette.
- **DON'T**: Nest cards inside cards unnecessarily; maintain clear visual hierarchy.
