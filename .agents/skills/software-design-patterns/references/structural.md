# Structural Patterns

Structural patterns explain how to **assemble objects and classes into larger structures** while keeping those structures flexible and efficient. Canonical reference: [refactoring.guru/design-patterns/structural-patterns](https://refactoring.guru/design-patterns/structural-patterns).

## Contents

1. [Adapter](#adapter)
2. [Bridge](#bridge)
3. [Composite](#composite)
4. [Decorator](#decorator)
5. [Facade](#facade)
6. [Flyweight](#flyweight)
7. [Proxy](#proxy)

---

## Adapter

**Intent.** Allow objects with incompatible interfaces to collaborate by wrapping one in an interface the other expects.

**Problem.** Your code expects interface A, but the class/library you must use exposes interface B (a third-party SDK, a legacy class, data in the wrong format). You can't (or shouldn't) change either side.

**Solution.** Create an *adapter*: a class that implements the interface your code expects and internally delegates to the incompatible object, translating calls and data back and forth.

**Structure (described).**
- `Target` — the interface the client code uses.
- `Adaptee` — the existing class with the incompatible interface.
- `Adapter` — implements `Target`, holds a reference to an `Adaptee`, and converts each call.

```ts
// Target: what our app expects.
interface JsonLogger { log(payload: object): void; }

// Adaptee: a third-party logger that only takes XML strings.
class XmlLogger {
  writeXml(xml: string): void { console.log("XML:", xml); }
}

class XmlLoggerAdapter implements JsonLogger {
  constructor(private adaptee: XmlLogger) {}
  log(payload: object): void {
    const xml = Object.entries(payload)
      .map(([k, v]) => `<${k}>${v}</${k}>`)
      .join("");
    this.adaptee.writeXml(`<log>${xml}</log>`);
  }
}

const logger: JsonLogger = new XmlLoggerAdapter(new XmlLogger());
logger.log({ level: "info", msg: "hi" }); // XML: <log><level>info</level><msg>hi</msg></log>
```

**Applicability.**
- You want to use an existing class but its interface doesn't match your code.
- You want to reuse several subclasses missing some common functionality, and can't add it upstream.

**Pros / Cons.**
- ➕ Single Responsibility: conversion code is separated from business logic.
- ➕ Open/Closed: introduce new adapters without changing client code.
- ➖ Overall complexity rises (new classes); sometimes simpler to just change the service code.

**Relations.**
- Adapter changes the interface of an *existing* object; Decorator enhances an object *without* changing its interface; Proxy keeps the *same* interface.
- Bridge is designed up-front to let parts vary; Adapter is applied to existing code to make unrelated classes work together.
- Facade defines a *new* simpler interface for a whole subsystem; Adapter makes one *existing* interface usable.

**Pitfalls.** A two-way adapter (object adapter via composition) is the idiomatic form in TS. Don't overuse adapters to paper over a poorly designed boundary that you actually control — fix the boundary instead.

---

## Bridge

**Intent.** Split a large class (or set of closely related classes) into two separate hierarchies — *abstraction* and *implementation* — which can be developed and extended independently.

**Problem.** You have a class that varies along two independent dimensions, and inheritance multiplies them. E.g. `Shape` × rendering backend gives `CircleVector`, `CircleRaster`, `SquareVector`, `SquareRaster`... Add a shape or a backend and the count explodes.

**Solution.** Switch from inheritance to composition. Extract one dimension (the *implementation*, e.g. the renderer) into its own interface hierarchy. The other dimension (the *abstraction*, e.g. shape) holds a reference to an implementation object and delegates the low-level work to it. The two hierarchies now grow independently.

**Structure (described).**
- `Abstraction` — high-level control logic; holds a reference to an `Implementation`.
- `RefinedAbstraction` — variants of the abstraction.
- `Implementation` — interface for the platform/low-level operations.
- `ConcreteImplementation` — platform-specific implementations.

```ts
// Implementation hierarchy.
interface Renderer { renderCircle(radius: number): string; }
class VectorRenderer implements Renderer {
  renderCircle(r: number) { return `Vector circle r=${r}`; }
}
class RasterRenderer implements Renderer {
  renderCircle(r: number) { return `Raster pixels for circle r=${r}`; }
}

// Abstraction hierarchy, bridged to a Renderer.
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
}
class Circle extends Shape {
  constructor(renderer: Renderer, private radius: number) { super(renderer); }
  draw() { return this.renderer.renderCircle(this.radius); }
}

console.log(new Circle(new VectorRenderer(), 5).draw()); // Vector circle r=5
console.log(new Circle(new RasterRenderer(), 5).draw()); // Raster pixels for circle r=5
```

**Applicability.**
- You want to divide a monolithic class that has several variants of some functionality.
- You need to extend a class in two orthogonal dimensions.
- You want to switch implementations at runtime.

**Pros / Cons.**
- ➕ Platform-independent abstractions; client code sees only high-level abstraction.
- ➕ Open/Closed and Single Responsibility on each dimension independently.
- ➖ Adds indirection/complexity; can be overkill for a highly cohesive class.

**Relations.**
- Bridge is usually designed *up front*; Adapter is applied *after the fact* to existing code.
- Abstract Factory can create and configure the right implementation for a Bridge.
- Resembles State/Strategy structurally (composition + delegation), but solves a different problem (two varying dimensions).

**Pitfalls.** Don't introduce Bridge for a class that varies along only one axis — that's just Strategy or plain composition. The payoff appears specifically when two dimensions both vary.

---

## Composite

**Intent.** Compose objects into tree structures and let clients treat individual objects and compositions uniformly.

**Problem.** You have a part-whole hierarchy (files and folders, UI elements and panels, order items and boxes-of-items) and want to run an operation (compute size, render, total price) over the whole tree without special-casing leaves vs containers.

**Solution.** Define a common `Component` interface for both *leaves* and *containers*. A container ("composite") holds child components and implements operations by delegating to its children and aggregating results. Because both implement the same interface, the client calls one method on the root and recursion handles the rest.

**Structure (described).**
- `Component` — interface common to all elements (e.g. `getPrice()`).
- `Leaf` — a basic element with no children; does real work.
- `Composite` — holds children of type `Component`; implements operations by iterating over children.
- `Client` — works with all elements through `Component`.

```ts
interface OrderItem { getPrice(): number; }

class Product implements OrderItem {
  constructor(private price: number) {}
  getPrice() { return this.price; }
}

class Box implements OrderItem {
  private items: OrderItem[] = [];
  add(item: OrderItem): void { this.items.push(item); }
  getPrice() { return this.items.reduce((sum, i) => sum + i.getPrice(), 0); }
}

const box = new Box();
box.add(new Product(10));
const inner = new Box();
inner.add(new Product(5));
inner.add(new Product(2));
box.add(inner);
console.log(box.getPrice()); // 17 — works uniformly on leaves and boxes
```

**Applicability.**
- You must implement a tree-like object structure.
- You want client code to treat simple and complex elements uniformly.

**Pros / Cons.**
- ➕ Work with complex trees via a single interface; recursion is encapsulated.
- ➕ Open/Closed: introduce new element types without breaking clients.
- ➖ Hard to give a *common interface* to classes whose functionality differs too much — the interface can become over-generalized.

**Relations.**
- Often combined with Iterator (to traverse) and Visitor (to run operations across the tree).
- Builder helps construct complex Composite trees; Prototype helps copy them.
- Decorator is structurally similar (a wrapper with one child) but adds responsibilities rather than aggregating many children.

**Pitfalls.** Deciding whether child-management methods (`add`/`remove`) live on the `Component` interface (uniform but lets clients call `add` on a leaf) or only on `Composite` (type-safe but less uniform) is the classic trade-off. Prefer safety unless uniform treatment is essential.

---

## Decorator

**Intent.** Attach new behaviors to objects by placing them inside wrapper objects that contain the behaviors, without altering their class.

**Problem.** You want to add responsibilities to individual objects dynamically and in *combinations* (a stream that is buffered, then compressed, then encrypted). Subclassing every combination explodes (`BufferedCompressedEncryptedStream`...) and is fixed at compile time.

**Solution.** Create wrappers that implement the *same interface* as the wrapped object and hold a reference to it. Each wrapper does its extra work and delegates the rest to the wrapped object. Because wrappers share the interface with the target, you can stack them in any order and combination at runtime.

**Structure (described).**
- `Component` — the common interface.
- `ConcreteComponent` — the base object being decorated.
- `BaseDecorator` — implements `Component`, holds a wrapped `Component`, forwards calls.
- `ConcreteDecorator` — adds behavior before/after delegating.

```ts
interface DataSource { read(): string; }

class FileSource implements DataSource {
  constructor(private data: string) {}
  read() { return this.data; }
}

abstract class DataSourceDecorator implements DataSource {
  constructor(protected wrappee: DataSource) {}
  read() { return this.wrappee.read(); }
}

class UppercaseDecorator extends DataSourceDecorator {
  read() { return super.read().toUpperCase(); }
}
class ExclaimDecorator extends DataSourceDecorator {
  read() { return super.read() + "!!!"; }
}

let source: DataSource = new FileSource("hello");
source = new UppercaseDecorator(source);
source = new ExclaimDecorator(source);
console.log(source.read()); // HELLO!!!
```

**Applicability.**
- You need to add responsibilities to objects at runtime without affecting other objects.
- Extension by subclassing is awkward or impossible (too many combinations, or a `final` class).

**Pros / Cons.**
- ➕ Add/remove responsibilities at runtime; combine behaviors by stacking wrappers.
- ➕ Single Responsibility: divide a monolithic class with many variants into small wrappers.
- ➖ Hard to remove a specific wrapper from the middle of a stack.
- ➖ Behavior depends on the order of decorators; deep stacks are hard to debug.

**Relations.**
- Adapter changes interface; Decorator keeps the same interface but adds behavior; Proxy keeps the same interface but controls access.
- Decorator vs Composite: both are recursive wrappers, but Composite *aggregates* children while Decorator *augments* a single child.
- Chain of Responsibility looks similar (linked handlers) but a CoR handler can stop the chain; decorators always pass through.

**Pitfalls.** In modern TS, simple behavior addition is sometimes cleaner with higher-order functions. Use Decorator when you genuinely need stackable, runtime-composable, interface-preserving wrappers.

---

## Facade

**Intent.** Provide a simplified, unified interface to a complex subsystem (a library, framework, or set of classes).

**Problem.** To do one common task, client code must instantiate and orchestrate many subsystem objects in a specific order, knowing too much about their internals. This couples the client to the subsystem's details.

**Solution.** Introduce a `Facade` class that offers a few convenient methods for the common use cases and internally drives the subsystem objects in the right sequence. Clients talk only to the facade. The full subsystem remains accessible for advanced needs.

**Structure (described).**
- `Facade` — exposes high-level methods; delegates to subsystem classes.
- `Subsystem classes` — do the real work; unaware of the facade.
- `Client` — uses the facade instead of the subsystem directly.

```ts
// Complex subsystem.
class VideoFile { constructor(public name: string) {} }
class Codec { decode(f: VideoFile) { return `decoded ${f.name}`; } }
class Resizer { resize(data: string, w: number) { return `${data} @${w}px`; } }
class Encoder { encode(data: string, fmt: string) { return `${data} -> ${fmt}`; } }

// Facade.
class VideoConverter {
  convert(filename: string, format: string, width: number): string {
    const file = new VideoFile(filename);
    const decoded = new Codec().decode(file);
    const resized = new Resizer().resize(decoded, width);
    return new Encoder().encode(resized, format);
  }
}

console.log(new VideoConverter().convert("clip.mov", "mp4", 720));
// decoded clip.mov @720px -> mp4
```

**Applicability.**
- You need a limited but straightforward interface to a complex subsystem.
- You want to layer your subsystems — a facade per layer reduces coupling between layers.

**Pros / Cons.**
- ➕ Isolates client code from subsystem complexity.
- ➖ A facade can become a *god object* coupled to all subsystem classes if it grows unchecked.

**Relations.**
- Facade defines a *new* interface to existing objects; Adapter makes an *existing* interface usable.
- Abstract Factory can be an alternative to a facade that mainly hides creation.
- A facade is often a Singleton (one shared entry point).
- Mediator and Facade both centralize — but Facade only *simplifies* access (subsystem doesn't know it exists), whereas Mediator *coordinates* peers that depend on it.

**Pitfalls.** Keep the facade thin. If it accumulates business logic, split it; the facade's job is orchestration and simplification, not owning the domain.

---

## Flyweight

**Intent.** Fit more objects into available RAM by sharing the common (intrinsic) parts of state between multiple objects instead of duplicating it in each.

**Problem.** You need an enormous number of similar objects (particles in a game, characters in a document, map markers). Each duplicates heavy shared data (sprite, texture, glyph metrics) and memory blows up.

**Solution.** Split each object's state into **intrinsic** (shared, immutable — e.g. the sprite) and **extrinsic** (unique per object — e.g. position) state. Store intrinsic state in shared *flyweight* objects, reused across many contexts. Pass extrinsic state in from the outside at call time. A factory caches and returns existing flyweights.

**Structure (described).**
- `Flyweight` — stores intrinsic (shared) state; methods accept extrinsic state as parameters.
- `FlyweightFactory` — caches flyweights and returns shared instances by key.
- `Context` — stores extrinsic state and a reference to a flyweight.
- `Client` — computes/holds extrinsic state.

```ts
// Intrinsic, shared state.
class TreeType {
  constructor(public name: string, public texture: string) {}
  draw(x: number, y: number) { return `${this.name}@(${x},${y}) tex=${this.texture}`; }
}

class TreeFactory {
  private static cache = new Map<string, TreeType>();
  static get(name: string, texture: string): TreeType {
    const key = `${name}:${texture}`;
    let type = this.cache.get(key);
    if (!type) { type = new TreeType(name, texture); this.cache.set(key, type); }
    return type; // shared across all trees of this kind
  }
}

// Extrinsic state lives in the lightweight context.
class Tree {
  constructor(private x: number, private y: number, private type: TreeType) {}
  draw() { return this.type.draw(this.x, this.y); }
}

const oak = TreeFactory.get("Oak", "oak.png");
const forest = [new Tree(1, 2, oak), new Tree(5, 9, oak)]; // share one TreeType
console.log(forest.map(t => t.draw()));
```

**Applicability.**
- The program must support a huge number of objects that barely fit in RAM, *and* much of their state is duplicated and can be made shared+extrinsic.

**Pros / Cons.**
- ➕ Large RAM savings when many objects share intrinsic state.
- ➖ Trades RAM for CPU — extrinsic state is recomputed or looked up each call.
- ➖ Code complexity rises; intrinsic state must be immutable; the split confuses readers.

**Relations.**
- Flyweight shows how to make many *small* objects; Facade shows one object representing a *whole subsystem*.
- A Flyweight resembles a Singleton if you reduce shared state to a single instance, but Singletons are mutable and singular by intent.
- Often combined with Composite to share leaf nodes.

**Pitfalls.** Apply only when memory is *measured* to be the bottleneck. It's a micro-optimization that complicates code; premature use is a classic over-engineering trap.

---

## Proxy

**Intent.** Provide a placeholder/surrogate for another object to control access to it.

**Problem.** You need to control access to an object — defer its expensive creation (lazy load), restrict who can use it, cache its results, log calls, or stand in for a remote object — but you don't want to change the object itself or the client code.

**Solution.** Create a `Proxy` class with the *same interface* as the real *service* object. The proxy holds a reference to the service (or creates it lazily) and adds its access-control behavior before/after delegating. Because interfaces match, clients can't tell the difference.

**Structure (described).**
- `ServiceInterface` — common interface.
- `Service` — the real object doing the work.
- `Proxy` — implements `ServiceInterface`, holds/creates a `Service`, adds control logic, delegates.
- `Client` — works through `ServiceInterface`.

Common variants: virtual (lazy init), protection (access control), remote (network stand-in), caching, logging.

```ts
interface Database { query(sql: string): string; }

class RealDatabase implements Database {
  query(sql: string) { return `result of [${sql}]`; }
}

// Caching + logging proxy.
class CachingDatabaseProxy implements Database {
  private cache = new Map<string, string>();
  constructor(private real: Database) {}
  query(sql: string): string {
    if (this.cache.has(sql)) return `(cached) ${this.cache.get(sql)}`;
    const result = this.real.query(sql);
    this.cache.set(sql, result);
    return result;
  }
}

const db: Database = new CachingDatabaseProxy(new RealDatabase());
console.log(db.query("SELECT 1")); // result of [SELECT 1]
console.log(db.query("SELECT 1")); // (cached) result of [SELECT 1]
```

**Applicability.**
- **Virtual proxy:** lazy initialization of a heavyweight object.
- **Protection proxy:** access control / authorization.
- **Remote proxy:** local stand-in for an object in another address space.
- **Logging / caching / smart-reference proxies:** cross-cutting concerns around the service.

**Pros / Cons.**
- ➕ Control the service object transparently to the client; manage lifecycle and add concerns (Open/Closed).
- ➖ Adds another class/indirection; response may be delayed by proxy logic.

**Relations.**
- Proxy keeps the *same interface* (Adapter changes it, Decorator augments behavior). Decorator and Proxy are structurally similar; the difference is *intent* — Decorator adds responsibilities, Proxy controls access/lifecycle and usually manages its service itself.
- A Facade is similar to a remote proxy in that both buffer a complex entity, but Facade offers a *new, simpler* interface.

**Pitfalls.** Don't confuse Proxy with Decorator. If you're *adding behavior the client asked for*, it's a Decorator; if you're *managing access to / lifecycle of* the service behind the scenes, it's a Proxy. In TS, the built-in `Proxy` object is a related but lower-level meta-programming tool, not this design pattern.
