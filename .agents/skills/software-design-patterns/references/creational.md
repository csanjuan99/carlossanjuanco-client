# Creational Patterns

Creational patterns deal with **object creation mechanisms** — making a system independent of how its objects are created, composed, and represented. Canonical reference: [refactoring.guru/design-patterns/creational-patterns](https://refactoring.guru/design-patterns/creational-patterns).

## Contents

1. [Factory Method](#factory-method)
2. [Abstract Factory](#abstract-factory)
3. [Builder](#builder)
4. [Prototype](#prototype)
5. [Singleton](#singleton)

---

## Factory Method

**Intent.** Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method defers instantiation to subclasses.

**Problem.** Your code is littered with `new ConcreteThing()`. Adding a new variant means hunting down every construction site and editing a `switch`. Construction logic is tangled with business logic, and the code is tightly coupled to concrete classes.

**Solution.** Replace direct constructor calls with calls to a special *factory method*. Objects are still created with `new`, but inside an overridable method. Subclasses change which product the factory method returns. The rest of the code works against a shared product *interface*, so it doesn't care which concrete product it got.

**Structure (described).**
- `Product` — interface common to all objects the factory produces.
- `ConcreteProduct` — different implementations of `Product`.
- `Creator` — declares the factory method returning `Product`; usually contains core business logic that *uses* the product.
- `ConcreteCreator` — overrides the factory method to return a specific `ConcreteProduct`.

```ts
interface Transport {
  deliver(): string;
}

class Truck implements Transport {
  deliver() { return "Deliver by land in a box"; }
}
class Ship implements Transport {
  deliver() { return "Deliver by sea in a container"; }
}

abstract class Logistics {
  // Factory method — subclasses decide the concrete Transport.
  abstract createTransport(): Transport;

  // Business logic that depends only on the Transport interface.
  planDelivery(): string {
    const transport = this.createTransport();
    return `Planning: ${transport.deliver()}`;
  }
}

class RoadLogistics extends Logistics {
  createTransport() { return new Truck(); }
}
class SeaLogistics extends Logistics {
  createTransport() { return new Ship(); }
}

const logistics: Logistics = new SeaLogistics();
console.log(logistics.planDelivery()); // Planning: Deliver by sea in a container
```

**Applicability.**
- You don't know in advance the exact types and dependencies of the objects your code works with.
- You want to let users of a library/framework extend its internal components.
- You want to reuse existing objects instead of rebuilding them (the factory method can also return cached instances).

**Pros / Cons.**
- ➕ Decouples creator from concrete products (Single Responsibility).
- ➕ Open/Closed: introduce new products without breaking existing code.
- ➖ Can bloat the class hierarchy — you may add many subclasses just to introduce a factory method.

**Relations.**
- Often the *starting point* of a design; evolves toward Abstract Factory, Prototype, or Builder.
- Abstract Factory is usually a set of Factory Methods.
- Template Method uses a similar "override a step" structure; Factory Method is often a specialization of one Template Method step.

**Pitfalls.** Don't introduce a Creator hierarchy if a single function with a parameter (a "simple factory") would do. Factory Method earns its keep only when subclassing for variation is already the design.

---

## Abstract Factory

**Intent.** Produce *families* of related objects without specifying their concrete classes.

**Problem.** You have several product families (e.g. `Modern` vs `Victorian` furniture: chair, sofa, table) and need to guarantee that the objects you create *match* — a modern chair with a modern sofa, never mixed. You also want to add new families without rewriting client code.

**Solution.** Declare an interface for each distinct product (`Chair`, `Sofa`). Declare an `AbstractFactory` interface with a creation method per product. Each *family* is a `ConcreteFactory` that produces only that family's products. Client code works against the factory and product interfaces, so swapping the factory swaps the whole family at once.

**Structure (described).**
- `AbstractProductA`, `AbstractProductB` — interfaces for each kind of product.
- `ConcreteProduct` — family-specific implementations.
- `AbstractFactory` — interface with one create-method per product kind.
- `ConcreteFactory` — produces one consistent family.
- The client receives a factory (often injected) and never names concrete classes.

```ts
interface Button { render(): string; }
interface Checkbox { render(): string; }

class MacButton implements Button { render() { return "[ Mac Button ]"; } }
class WinButton implements Button { render() { return "[ Win Button ]"; } }
class MacCheckbox implements Checkbox { render() { return "[x] Mac"; } }
class WinCheckbox implements Checkbox { render() { return "[x] Win"; } }

interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class MacFactory implements GUIFactory {
  createButton() { return new MacButton(); }
  createCheckbox() { return new MacCheckbox(); }
}
class WinFactory implements GUIFactory {
  createButton() { return new WinButton(); }
  createCheckbox() { return new WinCheckbox(); }
}

function buildUI(factory: GUIFactory) {
  return `${factory.createButton().render()} ${factory.createCheckbox().render()}`;
}

const factory: GUIFactory = process.platform === "darwin" ? new MacFactory() : new WinFactory();
console.log(buildUI(factory));
```

**Applicability.**
- Your code must work with various families of related products but stay independent of their concrete classes.
- You want a compile-time/structural guarantee that products from one family are used together.

**Pros / Cons.**
- ➕ Guarantees products from a factory are compatible.
- ➕ Isolates concrete classes; supports Open/Closed and Single Responsibility.
- ➖ Adding a *new kind of product* means changing the factory interface and *every* concrete factory.
- ➖ Can become an elaborate hierarchy for little gain if you only have one family.

**Relations.**
- Built from many Factory Methods (or Prototypes).
- A Facade can hide a complex Abstract Factory from clients.
- Often realized as a Singleton (one factory instance per family).

**Pitfalls.** Introducing Abstract Factory before a *second* family exists is premature. Start with Factory Method and grow into it.

---

## Builder

**Intent.** Construct complex objects step by step. The same construction process can produce different representations.

**Problem.** A constructor with a long list of optional parameters (the "telescoping constructor") is unreadable: `new House(4, 2, true, false, null, true, ...)`. Subclassing every configuration is worse. You need staged, readable, validated construction.

**Solution.** Extract object construction into a separate `Builder` object with methods for each step (`setWalls`, `setRoof`, `addGarage`). Call only the steps you need, then `build()` to get the result. An optional `Director` encapsulates common build *recipes* so clients don't repeat step sequences. Different builders implementing the same interface can produce different products from the same calls.

**Structure (described).**
- `Builder` — interface declaring construction steps.
- `ConcreteBuilder` — implements steps, holds the in-progress product, exposes `getResult()`.
- `Product` — the complex object being built (need not share an interface across builders).
- `Director` (optional) — defines the order of steps for standard configurations.

```ts
interface Query { sql: string; }

class SqlQueryBuilder {
  private parts = { select: "*", from: "", where: [] as string[], limit: 0 };

  from(table: string): this { this.parts.from = table; return this; }
  select(cols: string): this { this.parts.select = cols; return this; }
  where(cond: string): this { this.parts.where.push(cond); return this; }
  limit(n: number): this { this.parts.limit = n; return this; }

  build(): Query {
    if (!this.parts.from) throw new Error("FROM is required");
    let sql = `SELECT ${this.parts.select} FROM ${this.parts.from}`;
    if (this.parts.where.length) sql += ` WHERE ${this.parts.where.join(" AND ")}`;
    if (this.parts.limit) sql += ` LIMIT ${this.parts.limit}`;
    return { sql };
  }
}

const q = new SqlQueryBuilder()
  .select("id, name")
  .from("users")
  .where("active = true")
  .limit(10)
  .build();
console.log(q.sql); // SELECT id, name FROM users WHERE active = true LIMIT 10
```

**Applicability.**
- You want to get rid of a telescoping constructor.
- You need to build different representations of a product using the same steps.
- You want to construct objects that require many steps or step-by-step validation (Composite trees are a classic case).

**Pros / Cons.**
- ➕ Build objects step by step; defer or vary steps; reuse construction code.
- ➕ Single Responsibility: construction logic is isolated from business logic.
- ➖ Overall complexity rises — you create multiple new classes.

**Relations.**
- Builder focuses on *step-by-step* construction; Abstract Factory makes *families* in one call. Builder returns the product only at the end.
- A Director can use different Builders to produce different products.
- Often used to build complex Composite trees.

**Pitfalls.** For an object with only a couple of fields, a plain object literal or constructor is clearer. The fluent (chained) style is idiomatic in TS but is an optional convenience, not the pattern itself.

---

## Prototype

**Intent.** Create new objects by copying ("cloning") an existing instance, rather than constructing from scratch.

**Problem.** You need a copy of an object, but copying from outside is hard: some fields are private, and code that depends on concrete classes can't copy an object it only knows through an interface. Construction may also be expensive (heavy initialization).

**Solution.** Delegate cloning to the objects themselves via a common `clone()` method. Each class knows how to copy its own state, including private fields, and returns an object of its own type. Clients clone through the interface without coupling to concrete classes. A registry of pre-built prototypes lets you produce configured copies on demand.

**Structure (described).**
- `Prototype` — interface declaring `clone()`.
- `ConcretePrototype` — implements `clone()`, typically via a copy constructor that duplicates its fields (deep-copying nested objects as needed).
- `Client` — produces new objects by calling `clone()` on a prototype.

```ts
interface Cloneable<T> { clone(): T; }

class Shape implements Cloneable<Shape> {
  constructor(public x: number, public y: number, public color: string) {}
  clone(): Shape {
    return new Shape(this.x, this.y, this.color);
  }
}

class Circle extends Shape {
  constructor(x: number, y: number, color: string, public radius: number) {
    super(x, y, color);
  }
  clone(): Circle {
    return new Circle(this.x, this.y, this.color, this.radius);
  }
}

const original = new Circle(10, 20, "red", 15);
const copy = original.clone();
copy.color = "blue";
console.log(original.color, copy.color); // red blue
```

**Applicability.**
- Your code shouldn't depend on the concrete classes of objects you need to copy.
- You want to reduce subclasses that exist only to hold different initial configurations — store configured prototypes and clone them instead.
- Object construction is costly and a clone is cheaper than a fresh build.

**Pros / Cons.**
- ➕ Clone objects without coupling to their concrete classes.
- ➕ Replace repeated initialization with cloning of a prepared prototype.
- ➖ Cloning objects with circular references or deep nested graphs is tricky to get right.

**Relations.**
- Prototype and Factory Method are alternatives for decoupling creation; Prototype needs no subclassing but needs an initialized object.
- Abstract Factory can use Prototypes instead of subclassing.
- Designs heavy on Composite/Decorator often benefit from Prototype for copying complex structures.

**Pitfalls.** Beware *shallow vs deep* copies — a naive clone shares references to nested mutable objects. In TS, `structuredClone()` or explicit deep copies handle nested state; `Object.assign`/spread are shallow.

---

## Singleton

**Intent.** Ensure a class has only one instance and provide a global point of access to it.

**Problem.** Some resource should exist exactly once (a single configuration object, a connection pool). You want a single shared instance and a controlled access point — without a plain global variable that anyone can overwrite.

**Solution.** Make the constructor private/inaccessible, and expose a static `getInstance()` that creates the instance on first call and returns the cached one thereafter.

**Structure (described).**
- `Singleton` — holds a private static field for the sole instance, a private constructor, and a static accessor that lazily creates and returns it.

```ts
class AppConfig {
  private static instance: AppConfig | null = null;
  private settings = new Map<string, string>();

  private constructor() {
    this.settings.set("env", "production");
  }

  static getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  get(key: string): string | undefined { return this.settings.get(key); }
}

const a = AppConfig.getInstance();
const b = AppConfig.getInstance();
console.log(a === b); // true — same instance
```

**Applicability.**
- A class must have exactly one instance available to all clients (e.g. a shared resource).
- You need stricter control over a global than a bare global variable provides.

**Pros / Cons.**
- ➕ Guaranteed single instance with a global access point; lazily initialized.
- ➖ **Violates Single Responsibility** (controls both its own logic *and* its lifecycle).
- ➖ Acts as a hidden global — couples code to it and obscures dependencies.
- ➖ **Hard to unit-test:** clients can't easily substitute a mock; shared state leaks between tests.
- ➖ Needs care in multithreaded contexts (less of an issue in single-threaded JS, but matters across async/module boundaries).

**Relations.**
- A Singleton can be a degenerate Abstract Factory, Builder, or Prototype (a single instance of those).
- Facades are frequently implemented as Singletons.

**Pitfalls.** Singleton is widely considered an **anti-pattern** when used as a convenient global. Prefer **dependency injection**: create one instance at the composition root and pass it in. In modern TS/JS, a module exporting a single object instance achieves "one instance" without the testability downsides — reach for that before the classic `getInstance()` form.
