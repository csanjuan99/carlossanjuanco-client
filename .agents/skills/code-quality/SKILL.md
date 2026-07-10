---
name: mu-code-quality
description: "MU project-specific code quality rules. PRIORITY: apply these rules above all other style guidance when writing or reviewing TypeScript code in any MU repository (mu-aether-infra, mu-hermes-edge, mu-apollo-app)."
risk: safe
date_added: "2026-06-25"
---

# MU Code Quality Rules

These four rules are **non-negotiable** across all MU repositories. Apply them in every code generation, review, and refactor. They override generic style preferences.

---

## Rule 1 — Guard Clauses Over Nested `if`

Validate early, return early. Keep the happy path flat.

**Never:**
```typescript
if (condition) {
  if (otherCondition) {
    // actual work
  } else {
    return error()
  }
} else {
  return error()
}
```

**Always:**
```typescript
if (!condition) return error()
if (!otherCondition) return error()
// actual work
```

- Maximum **two conditions** per `if`. Three or more → extract a named predicate.
- Extract complex boolean checks into named predicates: `const isEligible = user.active && user.verified`.
- No `else` after a `return`.

**Never:**
```typescript
if (user.active && user.role === 'admin' && user.tenantId === tenantId) { ... }
```

**Always:**
```typescript
const isAuthorizedAdmin = user.active && user.role === 'admin'
if (!isAuthorizedAdmin || user.tenantId !== tenantId) return forbidden()
```

---

## Rule 2 — Single Responsibility

Each unit (function, class, Lambda handler, service, repository) does **one thing**.

- **Handler**: orchestrates only — parse → validate → call service → return response. No business logic.
- **Service**: business logic only. No DynamoDB access, no HTTP calls.
- **Repository**: DynamoDB access patterns only. No business logic.
- **Adapter**: external calls only (GraphQL/HTTP). No business logic.

If you can describe a function with "and", split it.

Max ~40 lines per function. If longer, extract named helpers.

---

## Rule 3 — Never `any`

`any` disables the type system. It is **banned**.

| Instead of | Use |
|-----------|-----|
| `any` | `unknown` + type guard / narrowing |
| `any[]` | `unknown[]` or specific typed array |
| `Record<string, any>` | `Record<string, unknown>` or a proper type |

**Narrowing pattern:**
```typescript
function process(input: unknown): string {
  if (typeof input !== 'string') throw new ValidationError('Expected string')
  return input.trim()
}
```

If the type comes from an external API or GraphQL response, use `unknown` at the boundary and narrow before use.

---

## Rule 4 — JSDoc Over Inline Comments

Document **above** symbols, never beside code.

**Never:**
```typescript
// Check if user has permission
if (user.role === 'admin') { ... }

const x = computeValue() // returns processed result
```

**Always:**
```typescript
/**
 * Returns the processed result from the raw input.
 * Uses X algorithm because Y constraint.
 */
function computeValue(): ProcessedResult { ... }
```

- Every exported function, class, type, hook, service, adapter, and repository gets a JSDoc block.
- The JSDoc explains **why**, not what (names explain what).
- Inline `//` comments are only for non-obvious workarounds: AWS quirks, business invariants, known limitations.

---

## Enforcement Checklist

Before finishing any code task in a MU repo:

- [ ] No nested `if/else` — guard clauses used throughout
- [ ] No `any` in new or modified code
- [ ] Each function/class has a single, describable responsibility
- [ ] All exported symbols have JSDoc blocks
- [ ] No inline `//` comments that describe *what* the code does
