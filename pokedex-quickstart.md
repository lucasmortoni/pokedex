# Pokédex — Spec-Driven Development Quickstart

A **Pokédex** is an interactive Pokémon encyclopedia that lets users browse, search, and filter Pokémon species, inspect detailed stats, elemental types, abilities, flavor text, and evolution chains, and track personal progress (such as caught or favorited Pokémon).

This guide adapts the official [GitHub Spec Kit Quickstart](https://github.github.com/spec-kit/quickstart.html) workflow to a **mobile Pokédex** project (iOS & Android via React Native + Expo) so you can test Spec-Driven Development (SDD) end-to-end and decide whether the output and workflow suit your style.

## Workflow Overview

| Step | Command | Purpose | Primary Artifact(s) |
| --- | --- | --- | --- |
| 1 | `/speckit-constitution` | Set project-wide rules and non-negotiable standards | `.specify/memory/constitution.md` |
| 2 | `/speckit-specify` | Describe *what* to build and *why* (no tech stack yet) | `specs/001-<feature>/spec.md` |
| 3 | `/speckit-clarify` | Surface and resolve ambiguities and edge cases | Updates `specs/001-<feature>/spec.md` |
| 4 | `/speckit-plan` | Choose the tech stack, gather Mobbin UI references, and design the data model & architecture | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| 5 | `/speckit-checklist` | Generate quality gates ("unit tests for requirements") | `specs/001-<feature>/checklists/<domain>.md` |
| 6 | `/speckit-tasks` | Break the plan into dependency-ordered tasks | `specs/001-<feature>/tasks.md` |
| 7 | `/speckit-analyze` | Audit consistency across spec, plan, tasks, and constitution | Read-only report (no files modified) |
| 8 | `/speckit-implement` | Execute tasks sequentially and write code + tests | Application source code, tests, updated `tasks.md` |
| 9 | `/speckit-converge` | Verify the codebase against all artifacts and close gaps | Gap report and convergence tasks in `tasks.md` |

---

## Prerequisites & Setup (Terminal)

In a fresh project, Spec Kit requires:

- **Python 3.11+**
- **`uv`** (recommended) or `pipx`
- A supported AI coding agent (such as Antigravity, GitHub Copilot, Claude Code, or Cursor)
- **Git** (optional; used for branch workflows and extensions)

For UI research (Step 4) and running the generated mobile app in Step 8, you will also want:

- **Mobbin MCP** connected in your AI coding agent (used during planning to search real-world mobile UI patterns)
- **Node.js (LTS)**
- **Expo Go** (on a physical iOS/Android device) or an **iOS Simulator / Android Emulator**

Standard installation and initialization commands:

```bash
# Install the Specify CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Initialize a new project (or use --here --force inside an existing folder)
specify init pokedex --integration agy
cd pokedex
```

> **Note for this workspace:** This repository is **already initialized** with Spec Kit (`speckit_version: 1.4.2`, `integration: agy`, `feature_numbering: sequential`, and the `branch-convention` extension with a `before_specify` validation hook). You can skip installation and start directly at **Step 1** inside your AI coding agent chat.

### Two Rules to Keep in Mind

1. **Run `/speckit-*` commands in your agent chat, not the terminal.** The CLI only scaffolds `.specify/` and `.agents/skills/`.
2. **Review each generated Markdown artifact before moving on.** Spec Kit is built around catching misaligned assumptions in Markdown while they are cheap to fix, before code generation begins.

---

## The 9-Step Spec-Driven Development Workflow (Agent Chat)

### Step 1: `/speckit-constitution` — Set the ground rules

**Purpose:** Establish the architectural guardrails, quality standards, and domain constraints that every later specification, plan, and implementation must obey. You typically run this once per project.

**Prompt to run:**

```text
/speckit-constitution Pokédex is a data-accurate, mobile-first Pokémon encyclopedia for iOS and Android.

Core principles:
1. Domain Accuracy: All Pokémon attributes (National Dex numbers, primary and secondary types, base stats, abilities, and evolution chains) must match canonical Pokémon rules, including proper type-effectiveness multipliers (0x, 0.25x, 0.5x, 1x, 2x, 4x).
2. Respectful Data Fetching & Caching: Avoid redundant network requests to external Pokémon APIs; cache fetched species and Pokémon entries and handle loading, poor connectivity or offline states, and rate-limit or network failures gracefully with clear retry states.
3. Strict Input Validation & Edge Cases: Search queries, filter combinations, and deep-link and navigation parameters (such as unknown Pokémon IDs or names) must be validated cleanly without crashing or showing blank screens.
4. Mobile Accessibility & Ergonomics: Support VoiceOver and TalkBack screen-reader labels for stat bars, type badges, and toggles, minimum touch targets (44x44pt / 48x48dp), safe-area insets, dynamic text scaling, and readable color contrast across all 18 Pokémon types on compact mobile viewports.
5. Clean Separation & Testability: Keep domain logic (search/filter matching, stat totals, type-effectiveness calculations, API response mapping) decoupled from UI screens and components and covered by automated unit and component tests.
6. Simplicity (YAGNI): Start with clean, focused modules and avoid premature abstractions, unused dependencies, or unrequested backend infrastructure.
```

**What it produces:**
- `.specify/memory/constitution.md`

**What to review before moving on:**
- Check that the principles feel concrete rather than generic, and remove or tighten any rule you do not want enforced during `/speckit-plan` and `/speckit-analyze`.

---

### Step 2: `/speckit-specify` — Describe what to build

**Purpose:** Turn your product idea into a structured feature specification (`spec.md`) with user stories, functional requirements, and acceptance criteria. Focus strictly on **what** the Pokédex does and **why**—avoid naming frameworks, libraries, or databases here.

*(Note: Because `branch-convention` is enabled in `.specify/extensions.yml`, the agent may run or prompt you for branch naming validation right before creating the feature specification.)*

**Prompt to run:**

```text
/speckit-specify Build a mobile Pokédex application where trainers can explore Pokémon and track their collection.

Core capabilities:
1. Browse Catalog: Display a smoothly scrolling, virtualized list or 2-column grid of Pokémon showing each Pokémon's National Dex number (formatted like #0001), name, primary and secondary elemental types, and artwork or sprite, with touch-friendly pagination or infinite scroll and pull-to-refresh.
2. Search & Filter: Let users search in real time by Pokémon name (case-insensitive partial match) or National Dex number, and filter via mobile-friendly filter controls (such as a filter sheet or horizontal filter chips) by elemental type (all 18 types, supporting single or dual-type matching), generation/region (Gen I Kanto through Gen IX Paldea), and collection status (All, Caught, Favorites), with an easy way to clear active filters and a clear empty state when no Pokémon match.
3. Detailed Pokédex Entry View: Tapping a Pokémon opens a detail screen showing:
   - High-resolution official artwork and a toggle between default and shiny sprites
   - Elemental types along with calculated defensive type effectiveness (weaknesses 2x/4x, resistances 0.5x/0.25x, and immunities 0x)
   - Base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed, and Stat Total) rendered with clear visual bars
   - Abilities (clearly distinguishing regular abilities from Hidden Abilities)
   - Physical profile (category/genus, height, weight) and Pokédex flavor text entry
   - Interactive evolution chain showing evolution stages and triggers (such as level, item, or friendship), where tapping another stage navigates to that Pokémon's entry
4. Personal Collection Tracking: Let users mark any Pokémon as "Caught" or "Favorite" from either the catalog card or the detail screen, persist those selections locally across app restarts, and show an overall caught progress counter (e.g., Caught X / Y).
```

**What it produces:**
- `specs/001-<feature-slug>/spec.md` (and updates active feature tracking in `.specify/feature.json`)

**What to review before moving on:**
- Verify that user stories have testable acceptance scenarios.
- Confirm that no premature tech-stack decisions leaked into `spec.md`.
- Look for any `[NEEDS CLARIFICATION]` markers the agent flagged.

---

### Step 3: `/speckit-clarify` — Resolve ambiguities

**Purpose:** Have the agent scan `spec.md` for underspecified behaviors or corner cases, ask targeted questions, and fold your answers directly back into the specification.

**Prompt to run:**

```text
/speckit-clarify Focus on Pokédex edge cases — regional forms (Alolan, Galarian, Hisuian, Paldean) and Mega/Gigantamax variants, branching evolutions (like Eevee or Wurmple), multi-game flavor text version selection, infinite scroll vs. paged loading and pull-to-refresh behavior, filter sheet vs. inline filter chips on small screens, Caught/Favorites local persistence scope, and offline or flaky mobile-network error states.
```

**What it produces:**
- Updates `specs/001-<feature-slug>/spec.md` in place with a clarifications section and refined requirements.

**What to review before moving on:**
- Re-read the updated requirements in `spec.md` to confirm your answers were captured accurately and didn't create contradictions with earlier user stories.

---

### Step 4: `/speckit-plan` — Choose the tech stack, UI references, and architecture

**Purpose:** Translate the validated `spec.md` into a concrete technical and UI blueprint evaluated against `.specify/memory/constitution.md`, grounded in real-world mobile UI patterns from Mobbin.

**Prompt to run:**

```text
/speckit-plan Build this as a cross-platform mobile application for iOS and Android using React Native, Expo (managed workflow), and TypeScript.

Technical choices:
- Navigation: Use Expo Router (file-based navigation built on React Navigation) with typed routes (e.g., tab/stack navigation for catalog/collection and `/pokemon/[idOrName]` for detail screens) supporting deep linking and native back gestures.
- UI Components & Styling: Use gluestack-ui styled with NativeWind (Tailwind CSS for React Native) and centralized theme tokens (including accessible color tokens for all 18 Pokémon types), using gluestack-ui primitives for mobile components (such as bottom sheets/Actionsheet for filters, badges, progress bars, inputs, and buttons), paired with `react-native-safe-area-context` for safe-area insets on notched iOS/Android devices.
- Media & Lists: Use `expo-image` for cached artwork/sprite rendering and tuned `FlatList` virtualization for smooth 60fps scrolling.
- UI references (Mobbin MCP): During Phase 0 (`research.md`), use the Mobbin MCP (`search_screens` / `search_flows` with `platform: "ios"`, searching one specific screen or pattern per query) to gather mobile UI references for:
  1. A browsable catalog grid/list screen with search and horizontal filter chips
  2. A filter bottom sheet with multi-select tags and clear/apply actions
  3. A rich detail screen with hero media, stat/metric bars, and sectioned metadata
  4. Empty search/filter states and collection progress indicators
  Document the selected apps, `mobbin_url` links, and layout/ergonomic takeaways in `research.md` (noting that references are iOS screens adapted for cross-platform iOS & Android, and optionally saving shortlisted screens to a Mobbin collection), then reference those patterns in `plan.md`.
- Data source: Fetch canonical Pokémon, species, type, and evolution-chain data from PokéAPI v2 (https://pokeapi.co/api/v2/) through a typed API client and domain-mapper layer.
- Caching & state: Use TanStack Query for request deduplication, in-memory/persisted caching, loading skeletons, pull-to-refresh, and retryable offline/network error states.
- Persistence: Store Caught and Favorite Pokémon IDs locally using AsyncStorage (`@react-native-async-storage/async-storage`) behind a small storage adapter so it is easy to test and swap later (e.g., to MMKV or SQLite).
- Testing: Use Jest (`jest-expo`) and React Native Testing Library with deterministic mocked PokéAPI fixtures for unit tests (type effectiveness, search/filter logic, mappers) and screen/component tests.
```

> **Tip for evaluating Spec Kit:** Because `spec.md` is stack-agnostic, you can also test swapping this prompt to a different stack (e.g., Flutter, native Kotlin + Jetpack Compose, native Swift + SwiftUI, or a React web app) and see how cleanly Spec Kit adapts `plan.md` without rewriting `spec.md`.

**What it produces:**
- `specs/001-<feature-slug>/plan.md`
- Supporting design artifacts such as `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` inside `specs/001-<feature-slug>/`

**What to review before moving on:**
- Check `plan.md` for constitution compliance (especially API caching, separation of domain logic from UI, and test coverage).
- Inspect `research.md` to confirm the Mobbin UI references (`mobbin_url` links and layout takeaways) match the visual hierarchy and ergonomics you want before generating tasks.
- Inspect `data-model.md` to ensure PokéAPI's split between `/pokemon/{id}`, `/pokemon-species/{id}`, `/evolution-chain/{id}`, and `/type/{id}` is modeled cleanly.

---

### Step 5: `/speckit-checklist` — Validate the spec

**Purpose:** Generate a domain-specific requirements-quality checklist—essentially "unit tests for your requirements"—to verify completeness, clarity, and edge-case coverage before generating tasks.

**Prompt to run:**

```text
/speckit-checklist Validate requirements quality for Pokédex data accuracy (18-type matrix, dual-type multipliers, base stats, evolution chains), search and filter edge cases, mobile accessibility (VoiceOver/TalkBack labels, touch-target sizes, safe-area layout, and type-badge contrast), and PokéAPI loading/offline resilience.
```

**What it produces:**
- `specs/001-<feature-slug>/checklists/<domain>.md` (for example, `pokedex-quality.md`)

**What to review before moving on:**
- Walk through any gaps or unchecked items surfaced by the checklist and resolve them in `spec.md` or `plan.md` before moving to task generation.

---

### Step 6: `/speckit-tasks` — Break the work down

**Purpose:** Convert `spec.md`, `plan.md`, and `data-model.md` into an actionable, dependency-ordered task checklist (`tasks.md`) grouped by setup, foundational layers, and user stories.

**Prompt to run:**

```text
/speckit-tasks
```

**What it produces:**
- `specs/001-<feature-slug>/tasks.md`

**What to review before moving on:**
- Verify that tasks follow dependency order (Expo project setup and domain types/mappers before mobile screens and components).
- Check for `[P]` markers on independent tasks that can be executed in parallel.
- Confirm that unit and screen/component test tasks and validation steps are explicitly included, not left as an afterthought.

---

### Step 7: `/speckit-analyze` — Check consistency across artifacts

**Purpose:** Run a read-only cross-artifact audit across `spec.md`, `plan.md`, `tasks.md`, and `constitution.md` to catch missing requirements, mismatched entity/route names, or constitution violations before any code is written.

**Prompt to run:**

```text
/speckit-analyze
```

**What it produces:**
- A structured, read-only consistency report in chat (no files are modified).

**What to review before moving on:**
- Look for any **Critical** or **High** findings (such as a requirement in `spec.md` with no corresponding task in `tasks.md`, or a plan decision that conflicts with `constitution.md`) and fix them before starting implementation.

---

### Step 8: `/speckit-implement` — Build it

**Purpose:** Instruct the agent to work through `tasks.md` in dependency order, writing code and tests while checking off completed items (`- [x]`).

**Prompt to run:**

```text
/speckit-implement
```

*(Tip: If you want tighter checkpoints while evaluating Spec Kit, you can tell the agent to execute one phase or one user story at a time, e.g., `/speckit-implement Execute Phase 1 and Phase 2 only, then pause for review.`)*

**What it produces:**
- Working application code and automated tests
- Updated `specs/001-<feature-slug>/tasks.md` with completed checkboxes

**What to review before moving on:**
- Run the Jest test suite and start the Expo dev server (`npx expo start`) in Expo Go, an iOS Simulator, or an Android Emulator.
- Tap through the Pokédex flows: search `#0025` or `pikachu`, filter by type and generation, open an entry with a branching evolution (like Eevee `#0133`), toggle Shiny sprites, mark Pokémon as Caught/Favorite, and force-close and reopen the app to verify local persistence.
- If any screen feels visually crowded or unergonomic, point your agent at that specific screen and ask it to search Mobbin MCP (or revisit the saved `mobbin_url` references in `research.md`) to refine the layout before running `/speckit-converge`.

---

### Step 9: `/speckit-converge` — Verify and close gaps

**Purpose:** Audit the actual codebase against `spec.md`, `plan.md`, and `tasks.md` to detect missing, partial, or unrequested behavior.

**Prompt to run:**

```text
/speckit-converge
```

**What it produces:**
- A convergence report comparing implemented code against your spec and plan.
- If gaps are found, it appends new convergence tasks to `tasks.md`.

**What to review before moving on:**
- If new tasks were appended to `tasks.md`, run `/speckit-implement` again to finish them, then re-run `/speckit-converge` until it reports **Converged**.

---

## Evaluating Spec Kit (Is the Workflow Likeable?)

By the end of Step 9, your repository should have a structure similar to:

```text
pokedex/
├── .specify/
│   ├── memory/constitution.md
│   └── feature.json
├── specs/
│   └── 001-pokedex-mvp/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       ├── contracts/
│       ├── checklists/
│       └── tasks.md
├── app/
├── src/
├── __tests__/
└── app.json
```

When deciding whether Spec Kit fits your workflow, evaluate these points:

1. **Signal vs. Ceremony:** Did reading and reviewing `spec.md`, `plan.md`, and `tasks.md` save time compared to freeform prompting, or did it feel too heavy for the size of the app?
2. **Clarification Quality:** Did `/speckit-clarify` catch subtle Pokédex edge cases (like regional variants, branching evolutions, or dual-type filtering) *before* code was written?
3. **Constitution Enforcement:** Did `.specify/memory/constitution.md` visibly shape `plan.md` and the generated tests (e.g., type-effectiveness coverage and API caching)?
4. **Consistency & Convergence:** Did `/speckit-analyze` and `/speckit-converge` catch real omissions rather than noise?
5. **UI Reference Grounding:** Did pulling real-world mobile patterns via Mobbin MCP into `research.md` and `plan.md` lead to cleaner, more idiomatic mobile screens during `/speckit-implement` than unguided UI generation?
6. **Iteration Test (Optional Feature 002):** To see how Spec Kit handles adding a second feature to an existing codebase, run `/speckit-specify` again for a **6-Slot Team Builder with Combined Type-Coverage Analysis** or a **Side-by-Side Pokémon Stat Comparison Tool**, then repeat Steps 3–9.

---

## Next Steps & References

- [GitHub Spec Kit Quickstart](https://github.github.com/spec-kit/quickstart.html)
- [Spec Kit Repository & Docs (`github/spec-kit`)](https://github.com/github/spec-kit)
- [Expo & Expo Router Documentation](https://docs.expo.dev/)
- [gluestack-ui & NativeWind Documentation](https://gluestack.io/ui/docs/home/overview/introduction)
- [Mobbin MCP Documentation](https://docs.mobbin.com/mcp/introduction)
- [PokéAPI v2 Documentation](https://pokeapi.co/docs/v2) — Official REST API docs for `/pokemon`, `/pokemon-species`, `/evolution-chain`, `/type`, and `/generation` endpoints
- Local workflow configuration in this repo: [`.specify/workflows/speckit/workflow.yml`](.specify/workflows/speckit/workflow.yml) and [`.specify/extensions.yml`](.specify/extensions.yml)
