# Pokédex Constitution

Pokédex is a data-accurate, mobile-first Pokémon encyclopedia for iOS and Android.

## Core Principles

### I. Domain Accuracy

All Pokémon attributes—National Dex numbers, primary and secondary elemental types, base stats,
stat totals, abilities (distinguishing regular and Hidden Abilities), physical profiles, flavor
text, and evolution chains—MUST conform to canonical Pokémon rules. Defensive type-effectiveness
calculations MUST produce exact canonical multipliers (`0x`, `0.25x`, `0.5x`, `1x`, `2x`, `4x`) for
both single-type and dual-type Pokémon.

**Rationale:** Trainers rely on a Pokédex as an authoritative encyclopedia; inaccurate type
matchups, stats, or evolution data immediately undermine product trust.

### II. Respectful Data Fetching & Caching

External Pokémon API integrations MUST avoid redundant network requests by caching fetched Pokémon,
species, type, and evolution-chain entries. Every network-backed screen MUST handle loading, poor
connectivity, offline states, rate limits, and network failures gracefully with clear,
user-actionable retry states rather than silent errors or indefinite loading indicators.

**Rationale:** Public Pokémon APIs expect considerate caching, and mobile users frequently browse
under unstable or offline network conditions.

### III. Strict Input Validation & Edge Cases

Search queries, multi-facet filter combinations, and deep-link or navigation parameters (such as
unknown, malformed, or out-of-range Pokémon IDs or names) MUST be validated and normalized cleanly.
Invalid inputs and zero-match filter states MUST render explicit recovery or empty states and MUST
NEVER crash the application or produce blank screens.

**Rationale:** Free-text queries, combined filters, and external deep links routinely introduce
unexpected input shapes that must fail safely.

### IV. Mobile Accessibility & Ergonomics

All interactive controls, stat bars, elemental type badges, and collection toggles MUST provide
descriptive screen-reader labels for iOS VoiceOver and Android TalkBack. Interactive touch targets
MUST meet minimum platform ergonomics (`44x44pt` on iOS / `48x48dp` on Android). Screens MUST
respect device safe-area insets, support dynamic text scaling without clipping essential content,
and maintain readable foreground/background color contrast across all 18 Pokémon types on compact
mobile viewports.

**Rationale:** A mobile-first encyclopedia must remain legible, comfortable to operate one-handed,
and fully accessible with assistive technologies across diverse iOS and Android devices.

### V. Clean Separation & Testability

Domain logic—including search and filter matching, base stat total aggregation, defensive
type-effectiveness calculations, and external API response mapping—MUST stay decoupled from UI
screens, navigation wiring, and storage adapters. All domain modules MUST be covered by
deterministic automated unit tests, and critical mobile screens and components MUST be covered by
automated component tests using mocked API fixtures.

**Rationale:** Decoupling pure domain logic from mobile UI layers keeps automated tests fast,
repeatable, and independent of external network availability.

### VI. Simplicity (YAGNI)

Implementation MUST start with small, focused modules and avoid premature abstractions, unused
dependencies, or unrequested backend infrastructure. Any additional architectural layer or
third-party library MUST be justified by a concrete requirement in the active specification.

**Rationale:** Restraint prevents over-engineering, reduces mobile bundle and maintenance overhead,
and keeps specifications closely aligned with delivered code.

## Mobile & Data Constraints

- **Target Platforms:** Primary experience targets iOS and Android phones in compact portrait
  viewports, with graceful layout adaptation across screen sizes.
- **Typed Boundary Mapping:** External Pokémon API payloads MUST be normalized through a typed
  client and domain mapper before reaching UI screens or components.
- **On-Device Persistence:** Personal collection state (e.g., Caught and Favorite selections) MUST
  persist locally on-device behind a small, swappable storage adapter without introducing an
  unrequested backend service.
- **UI Pattern Grounding:** Mobile screen layouts SHOULD reference verified real-world mobile UI
  patterns documented during planning while preserving all accessibility and contrast requirements.

## Development Workflow & Quality Gates

- **Spec-Driven Progression:** Features MUST follow the Spec Kit workflow (`spec.md` -> `plan.md`
  / `research.md` / `data-model.md` -> `tasks.md` -> consistency audit -> implementation).
- **Constitution Gates:** Every `/speckit-plan` and `/speckit-analyze` run MUST verify adherence to
  all six Core Principles before code generation begins.
- **Deterministic Tests:** Automated unit and component tests MUST pass without live network calls
  before a feature is marked complete.
- **Branch & Folder Convention:** Feature branches and spec directories MUST comply with
  `.specify/branch-convention.yml`.

## Governance

- **Authority:** This constitution supersedes ad-hoc conventions and conflicting guidance across
  specifications, plans, tasks, and implementation.
- **Amendments:** Amendments MUST update `.specify/memory/constitution.md` with a semantic version
  bump, updated `Last Amended` date, and a Sync Impact Report (which is temporary review metadata
  expected to be removed prior to committing). Any impacted specs or plans MUST be audited for
  alignment.
- **Versioning Policy:** Semantic versioning (`MAJOR.MINOR.PATCH`) governs this document:
  - `MAJOR`: Backward-incompatible principle removals or redefinitions.
  - `MINOR`: New principles, new governance sections, or materially expanded rules.
  - `PATCH`: Clarifications, wording improvements, or typo fixes without semantic change.
- **Compliance Review:** All plans, analyses, and code reviews MUST verify compliance with these
  principles. Any necessary complexity or exception MUST be explicitly justified in the feature's
  `plan.md`.

**Version**: 1.0.0 | **Ratified**: 2026-11-27 | **Last Amended**: 2026-11-27
