---
name: clean-code
description: Use when writing new code, reviewing a diff, or refactoring for readability and maintainability — naming, function size and single responsibility, reducing nesting, comments, error handling, removing duplication, code smells, SOLID — even when the user just says "clean this up", "make it readable", "review this", or "refactor", without naming Clean Code. Encodes Clean Code (Robert C. Martin lineage) and broad craftsmanship guidance as defaults with tradeoffs, applied in TypeScript/JavaScript but language-agnostic in spirit.
---

# Clean Code

Practical guidance for writing and reviewing code that the next person can read, change, and trust. The rules below are **defaults backed by reasons**, not commandments. When a rule and clarity conflict, clarity wins. When a rule and the team's established convention conflict, the convention usually wins. Apply judgment; cite the cost a rule prevents, not the rule's authority.

## 0. The core idea: meaning over cleverness

Code is read far more often than it is written — by reviewers, by teammates, by you in six months. Every minute saved writing a clever one-liner is paid back many times over in confused reading. Optimize for the next reader's comprehension, not for keystrokes or for showing off what the language can do.

```ts
// Before: clever, dense, hostile to the reader
const r = u.filter(x => x.a && !x.d).map(x => x.id);

// After: the intent is on the surface
const activeUserIds = users
  .filter(user => user.isActive && !user.isDeleted)
  .map(user => user.id);
```

The "after" is longer and that is fine. Cost prevented: the reader no longer has to mentally execute the code to discover what `r`, `u`, `x`, `a`, and `d` mean.

When you reach for cleverness — a bit-twiddling trick, a dense reduce, a regex — leave a short comment explaining the *why*, or reconsider whether the clever version earns its cost.

## 1. Naming

Names are the densest documentation you have. A good name removes the need for a comment.

**Intention-revealing.** The name should answer why it exists, what it does, and how it is used. If it needs a comment to explain, it is the wrong name.

```ts
// Before
const d = 30; // days until expiry
// After
const daysUntilExpiry = 30;
```

**Avoid abbreviations, encodings, and noise.** Spell words out (`message`, not `msg`; `index`, not `idx` unless idiomatic in a tight loop). Skip Hungarian-style type prefixes (`strName`, `iCount`) — modern tooling and types already tell you the type, and the prefix lies the moment the type changes. Drop noise words: `theUser`, `userData`, `userInfo`, `userObject` all usually just mean `user`.

**Pronounceable and searchable.** `generationTimestamp` beats `genymdhms` — you can say it in a code review. Single letters and bare numbers are nearly unsearchable; prefer a named constant you can grep for over a literal buried in code.

**Consistent vocabulary.** Pick one word per concept and stick to it. Don't mix `fetch`, `get`, and `retrieve` for the same operation, or `User` and `Customer` for the same entity. Inconsistency forces readers to wonder whether the difference is meaningful.

**Names reflect their level of abstraction.** High-level code reads in domain terms (`processPayment`); low-level helpers can be more mechanical (`appendChecksumByte`). A class named `OrderManager` whose methods are `doStuff` and `handleIt` mixes a domain noun with contentless verbs.

**Booleans read as predicates.** Prefix with `is`, `has`, `should`, `can` so conditions read like sentences: `if (user.isVerified)`, `if (cart.hasItems)`. Avoid negatives in the name (`isNotReady` makes `!isNotReady` a puzzle).

**Functions are verbs, classes are nouns.** `calculateTotal()`, `sendEmail()` for functions; `Invoice`, `EmailService` for classes/types. A function named `data()` or a class named `Manage` signals the abstraction wasn't thought through.

```ts
// Before
class Mgr {
  proc(u: any, f: boolean) { /* ... */ }
}
// After
class SubscriptionService {
  renew(subscription: Subscription, options: RenewalOptions) { /* ... */ }
}
```

Tradeoff: don't over-engineer names. Loop counters `i`, `j` and a lambda's `x` in a tiny, obvious scope are fine — short scope tolerates short names. Reserve the effort for names that travel.

## 2. Functions

**Small, and doing one thing.** A function should do one thing, do it well, and do only it. The practical test: can you describe what it does in one sentence without "and"? Smaller functions are easier to name, test, and reuse. "Small" is a guide, not a line-count law — a flat 40-line switch that does one thing can be clearer than splitting it five ways.

**One level of abstraction per function.** Don't mix high-level policy ("charge the customer") with low-level mechanics (string formatting, array indexing) in the same body. Mixing levels forces the reader to constantly shift gears. Extract the lower level into a named helper.

**Few arguments.** Zero to two is ideal; three is a smell worth a second look; more than three usually wants a parameter object. Each argument is something the caller must understand and supply correctly, and long positional lists invite mistakes (`createUser("Ana", "Lopez", true, false, null)` — what are those booleans?).

```ts
// Before: positional soup
function createUser(first, last, isAdmin, sendEmail, referrer) { /* ... */ }
createUser("Ana", "Lopez", true, false, null);

// After: a named options object — call sites self-document
interface CreateUserInput {
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
  sendWelcomeEmail?: boolean;
  referrer?: string;
}
function createUser(input: CreateUserInput) { /* ... */ }
createUser({ firstName: "Ana", lastName: "Lopez", isAdmin: true });
```

**No flag arguments.** A boolean parameter that switches behavior means the function does two things; split it. The call site `render(true)` tells the reader nothing.

```ts
// Before
function render(isPreview: boolean) {
  if (isPreview) { /* preview path */ } else { /* full path */ }
}
render(true);

// After
function renderPreview() { /* preview path */ }
function renderFull() { /* full path */ }
renderPreview();
```

**No hidden side effects.** A function named `getUser` should not also create a session. Surprises that aren't in the name are where bugs hide. If a function must mutate or perform I/O, let the name say so (`loadAndCacheUser`).

**Command-query separation.** A function either *does* something (command, returns void/throws) or *answers* something (query, returns a value), not both. `if (set("username", "ana"))` is a riddle — does `set` test existence or perform assignment? Keep them separate so callers never have to guess.

**Guard clauses over deep nesting.** Handle the edge cases up front and return early; let the happy path flow down the left margin, un-indented. Deep nesting forces the reader to hold many conditions in their head at once.

```ts
// Before: the real work is buried four levels deep
function getPayrate(employee) {
  if (employee) {
    if (employee.isActive) {
      if (employee.contract) {
        return employee.contract.rate;
      } else {
        throw new Error("No contract");
      }
    } else {
      throw new Error("Inactive");
    }
  } else {
    throw new Error("No employee");
  }
}

// After: guards first, happy path last and flat
function getPayrate(employee) {
  if (!employee) throw new Error("No employee");
  if (!employee.isActive) throw new Error("Inactive");
  if (!employee.contract) throw new Error("No contract");
  return employee.contract.rate;
}
```

## 3. Comments

The best comment is the one you didn't need to write because the code says it. A comment is a small failure to express the intent in code — sometimes a necessary one, but always weigh expressing it in the code first. Comments also rot: code changes, comments get forgotten, and a stale comment is worse than none because it lies.

**Good comments** earn their place: explaining *why* (the non-obvious rationale, a workaround for a known bug, a business rule), warnings of consequences, `TODO`/`FIXME` with enough context to act on, legal/license headers, and clarifying intent that the code genuinely can't carry.

```ts
// Good: explains a non-obvious WHY the code can't show
// Stripe rounds half-up; we round half-even to match the ledger system,
// otherwise reconciliation drifts by a cent on large batches.
const rounded = roundHalfEven(amount);
```

**Bad comments** are noise or lies: redundant restatements of the code, commented-out code (delete it — version control remembers), and misleading or outdated comments.

```ts
// Bad: says nothing the code doesn't
i++; // increment i
```

**Delete dead code.** Commented-out blocks and unreachable functions make readers wonder if they matter. They don't — version control has them if you ever need them back. Carrying them rots trust in the whole file.

## 4. Formatting and structure

Consistent formatting lets readers focus on logic instead of re-parsing layout. Most of this should be automated so it never reaches review.

**Vertical density and distance.** Lines that are tightly related belong together; blank lines separate distinct thoughts. Declare variables close to where they're used, not in a clump at the top. Closely related concepts should be vertically near each other so the reader doesn't scroll to connect them.

**Caller above callee.** Order functions so the high-level entry point reads first and the helpers it calls follow below, like a newspaper: headline first, details after. The reader meets the overview before the mechanics.

**Consistent style via tooling.** Use Prettier (or equivalent) for formatting and ESLint (or equivalent) for rules, wired into CI and pre-commit. Style debates in review are a waste of human attention; let the machine decide so people review behavior. Match the existing project's configuration rather than imposing your own.

## 5. Error handling

Error handling matters, but it shouldn't drown the main logic. Separate the happy path from the failure handling so each stays readable.

**Prefer exceptions or a `Result` type over error codes.** Error codes force every caller to check and branch inline, tangling error handling into the logic and making it easy to forget a check.

```ts
// Before: error codes silently ignored, logic and errors tangled
const code = saveOrder(order);
if (code === -1) { /* ... */ }   // easy to forget; easy to mishandle

// After: throw, and handle at the boundary where you can do something
function saveOrder(order: Order): SavedOrder {
  if (!order.items.length) throw new EmptyOrderError(order.id);
  return repository.persist(order);
}
```

**Don't return or pass `null` casually.** A `null` that escapes a function becomes every caller's problem and the source of the next null-reference crash. Prefer returning an empty collection, a typed "not found" result, or throwing. If absence is a real state, model it explicitly (`User | undefined`) so the type system forces callers to handle it.

**Fail fast.** Validate inputs at the boundary and throw immediately with a clear message, rather than letting bad data flow deep into the system where the eventual failure is far from its cause.

**Don't swallow errors.** An empty `catch {}` discards the one piece of information that would let someone diagnose the problem. At minimum log with context; better, handle or rethrow. Swallowing turns a loud failure into a silent, much harder bug.

**Provide context in errors.** "Operation failed" tells no one anything. Include what was being attempted and the relevant identifiers: `Failed to charge order ${order.id}: ${cause.message}`. The error message is often the only clue the on-call engineer gets at 3am.

## 6. DRY, KISS, YAGNI — and their counter-warnings

**DRY (Don't Repeat Yourself).** Every piece of *knowledge* should have one authoritative home. The failure mode it prevents: a rule encoded in five places, four of which get updated when the rule changes and one of which silently keeps the old behavior. **Counter-warning:** DRY is about knowledge, not about text that happens to look alike. Two snippets that are identical today but change for different reasons are *coincidental* duplication; merging them couples unrelated things, and the wrong abstraction is more expensive to unwind than duplication is to tolerate. Follow the **rule of three**: duplicate once freely, notice at the second repeat, and abstract on the third — by then you understand the shared shape well enough to name it.

**KISS (Keep It Simple).** Prefer the straightforward solution over the impressive one. Complexity is a tax paid on every future read and change. A plain loop or a flat conditional that any reader understands beats a generic, configurable framework solving a problem you have once.

**YAGNI (You Aren't Gonna Need It).** Build for the requirements you have, not the ones you imagine. Speculative generality — extra parameters, abstract base classes, plugin points "for later" — is code you must carry, test, and read now, for a future that usually arrives different from what you guessed, or never arrives. Delete the hooks nobody calls.

These three pull against each other on purpose. The judgment is knowing which tax you're paying: duplication's maintenance cost, or abstraction's comprehension-and-coupling cost. When unsure, lean toward the simple, duplicated version — it is the cheaper mistake to fix.

## 7. SOLID, practically

Five principles for keeping object-oriented (and broadly, modular) code changeable. Treat them as lenses for spotting fragile designs, not boxes to check.

**S — Single Responsibility.** A module should have one reason to change. Mixing, say, business rules with database access means a schema change and a rule change both edit the same file, and they collide. *Matters when* a class keeps getting touched for unrelated reasons.

```ts
// Before: invoice math AND persistence AND email in one class
class Invoice { calculateTotal() {} saveToDb() {} sendEmail() {} }
// After: each has one reason to change
class Invoice { calculateTotal() {} }
class InvoiceRepository { save(invoice: Invoice) {} }
class InvoiceMailer { send(invoice: Invoice) {} }
```

**O — Open/Closed.** Open for extension, closed for modification: add new behavior by adding code, not by editing a switch that's a magnet for regressions. *Matters when* you keep editing the same conditional to add cases. A handler map or polymorphism lets new cases register without touching the existing ones.

**L — Liskov Substitution.** A subtype must be usable anywhere its base type is, without surprising the caller. The classic violation: a `Square extends Rectangle` whose `setWidth` also changes height, breaking code that trusted the `Rectangle` contract. *Matters when* inheritance hierarchies start needing `if (x instanceof Y)` checks — a sign the substitution promise is broken.

**I — Interface Segregation.** Don't force a client to depend on methods it doesn't use. A fat interface drags unrelated dependencies and forces dummy implementations. Prefer several small, role-focused interfaces. *Matters when* implementers keep writing `throw new Error("not supported")` for methods they don't need.

**D — Dependency Inversion.** High-level policy shouldn't depend on low-level details; both depend on an abstraction. Depend on an interface, inject the concrete implementation. *Matters when* you want to test business logic without a real database, or swap a provider without rewriting the logic.

```ts
// Before: service welded to a concrete client
class NotificationService { private sg = new SendGridClient(); }
// After: depends on an abstraction, implementation injected
interface EmailSender { send(to: string, body: string): Promise<void>; }
class NotificationService {
  constructor(private readonly sender: EmailSender) {}
}
```

These reinforce each other and can be overdone. A small script doesn't need five interfaces. Reach for a principle when you feel the pain it addresses — not preemptively.

## 8. Code smells and their refactors

Smells are hints, not proofs. Each points to a likely improvement; confirm the cost is real before acting.

- **Long function** — does too much. → Extract Function until each does one thing.
- **Large class** — too many responsibilities. → Extract Class along responsibility lines (see SRP).
- **Long parameter list** — too many positional args. → Introduce a parameter object; pass a whole object instead of its fields.
- **Duplicated code** — same knowledge in several places. → Extract a shared function/module (respecting the rule of three).
- **Feature envy** — a method uses another object's data more than its own. → Move Method to the class that owns the data.
- **Primitive obsession** — strings/numbers standing in for domain concepts (`string` for an email, `number` for money). → Introduce a small value type (`Email`, `Money`) that centralizes validation and behavior.
- **Shotgun surgery** — one change forces edits across many files. → Gather the scattered responsibility into one place.
- **Divergent change** — one module edited for many unrelated reasons. → Split it so each part has a single reason to change (the SRP cure; the inverse of shotgun surgery).
- **Comments as deodorant** — a comment explaining confusing code. → Refactor or rename so the comment becomes unnecessary, then delete it.
- **Dead code** — unreachable or unused. → Delete it; version control remembers.
- **Magic numbers/strings** — unexplained literals. → Name them as constants (`const MAX_RETRIES = 3`) so they're searchable and self-documenting.

```ts
// Magic number → named constant
// Before
if (attempts > 3) throw new Error("too many");
// After
const MAX_LOGIN_ATTEMPTS = 3;
if (attempts > MAX_LOGIN_ATTEMPTS) throw new Error("too many");
```

## 9. Boundaries and tests

Test code is real code: it is read, maintained, and trusted, so it deserves the same care as production code. Sloppy tests rot, get disabled, and stop protecting you.

**One concept per test.** Each test verifies one behavior. Multiple unrelated assertions in one test make a failure ambiguous — you can't tell at a glance what broke. (One *concept* may legitimately need a few assertions; the point is one reason to fail.)

**Readable: Arrange–Act–Assert.** Structure each test so setup, the action, and the verification are visually distinct. A test is also documentation of how the unit is meant to behave; make that story easy to read.

**FIRST.** Good unit tests are **F**ast (so people actually run them), **I**ndependent (no ordering or shared-state coupling), **R**epeatable (same result every run, no reliance on clock, network, or random), **S**elf-validating (a clear pass/fail, no manual log-reading), and **T**imely (written alongside the code, while the design is still malleable).

```ts
// Readable, one concept, self-validating
test("applies the loyalty discount to members", () => {
  const cart = new Cart([{ price: 100 }]);          // Arrange
  const total = cart.totalFor({ isMember: true });  // Act
  expect(total).toBe(90);                           // Assert
});
```

At **boundaries** (third-party libraries, external services), wrap the foreign API behind a thin interface you own. It keeps their churn from rippling through your code and gives you a seam to fake in tests.

## 10. Pragmatism: when to break the rules

These rules serve readability and maintainability; they are not the goal themselves. Break one when keeping it would make the code worse.

- **Readability beats purity.** If splitting a function into six tiny pieces scatters one coherent thought across the file, leave it whole. If a touch of duplication reads clearer than a strained abstraction, keep the duplication.
- **Team conventions beat personal preference.** A consistent codebase that follows a different style than you'd choose is more valuable than a locally "perfect" file that fights its surroundings. Match what's there; raise style changes as a team decision, not a drive-by edit.
- **Don't gold-plate.** A throwaway script, a migration that runs once, a prototype validating an idea — these don't need the full treatment. Spend rigor where the code will live and change. Match effort to the code's expected lifespan and blast radius.
- **Performance and constraints sometimes win.** A hot path may justify a denser, less pretty implementation; document *why* so the next reader doesn't "clean it up" and reintroduce the problem.

When you break a rule deliberately, that's engineering judgment. When you break it by accident or laziness, that's the mess these rules exist to prevent. The difference is whether you can state the reason.
