# Behavioral Patterns

Behavioral patterns are concerned with **algorithms and the assignment of responsibilities** between objects — how objects communicate and distribute work. Canonical reference: [refactoring.guru/design-patterns/behavioral-patterns](https://refactoring.guru/design-patterns/behavioral-patterns).

## Contents

1. [Chain of Responsibility](#chain-of-responsibility)
2. [Command](#command)
3. [Iterator](#iterator)
4. [Mediator](#mediator)
5. [Memento](#memento)
6. [Observer](#observer)
7. [State](#state)
8. [Strategy](#strategy)
9. [Template Method](#template-method)
10. [Visitor](#visitor)
11. [Interpreter](#interpreter) *(brief)*

---

## Chain of Responsibility

**Intent.** Pass a request along a chain of handlers. Each handler decides either to process the request or to pass it to the next handler.

**Problem.** A request must pass through several processing steps (auth, validation, rate-limiting, caching) whose order and presence vary. Cramming them into one growing block of conditionals is rigid and hard to reorder or reuse.

**Solution.** Turn each check into a standalone *handler* with a `setNext()` link and a `handle()` method. Each handler either fully handles the request and stops, or passes it to the next link. You assemble chains at runtime in any order.

**Structure (described).**
- `Handler` — interface with `setNext(handler)` and `handle(request)`.
- `BaseHandler` — stores `next` and forwards by default.
- `ConcreteHandler` — processes and/or passes along.
- `Client` — builds the chain and sends requests to the first link.

```ts
abstract class Handler {
  private next?: Handler;
  setNext(h: Handler): Handler { this.next = h; return h; }
  handle(request: string): string {
    return this.next ? this.next.handle(request) : `unhandled: ${request}`;
  }
}

class AuthHandler extends Handler {
  handle(req: string): string {
    if (req === "anon") return "rejected: not authenticated";
    return super.handle(req);
  }
}
class RateLimitHandler extends Handler {
  handle(req: string): string {
    if (req === "flood") return "rejected: rate limited";
    return super.handle(req);
  }
}
class AppHandler extends Handler {
  handle(req: string): string { return `200 OK for ${req}`; }
}

const auth = new AuthHandler();
auth.setNext(new RateLimitHandler()).setNext(new AppHandler());
console.log(auth.handle("user")); // 200 OK for user
console.log(auth.handle("anon")); // rejected: not authenticated
```

**Applicability.**
- More than one object may handle a request and the handler isn't known in advance.
- You want to issue a request to one of several handlers without coupling to the receiver.
- The set/order of handlers should be configurable at runtime.

**Pros / Cons.**
- ➕ Decouples sender from receivers; control the order of handling; Single Responsibility & Open/Closed.
- ➖ Some requests may go unhandled (fall off the end of the chain).

**Relations.**
- Often used with Composite (a component passes a request up its parent chain).
- Structurally like Decorator (linked wrappers), but a CoR handler can *stop* processing; decorators always pass through and don't break the flow.
- Command represents the *request* as an object; CoR represents the *handlers*. They combine well.

**Pitfalls.** Ensure the chain always terminates meaningfully; an unhandled request silently dropped is a common bug. Don't model a simple linear pipeline as CoR if it never branches — a plain array of functions is clearer.

---

## Command

**Intent.** Turn a request into a stand-alone object containing all information about the request. This lets you parameterize methods with requests, queue or log them, and support undo.

**Problem.** UI elements (buttons, menu items, shortcuts) all need to trigger operations. Hard-coding business logic into each widget couples them tightly and duplicates code. You also want undo/redo, queuing, or logging of operations.

**Solution.** Encapsulate each request as a `Command` object implementing a single `execute()` (and optionally `undo()`). A command holds its receiver and parameters. Invokers (buttons, queues, schedulers) trigger commands without knowing what they do. Commands decouple the object that *requests* an operation from the one that *performs* it.

**Structure (described).**
- `Command` — interface with `execute()` (and maybe `undo()`).
- `ConcreteCommand` — binds a receiver + arguments to an action.
- `Receiver` — the object that does the real work.
- `Invoker` — holds and triggers commands.
- `Client` — creates and configures commands.

```ts
interface Command { execute(): void; undo(): void; }

class TextEditor { content = ""; }

class AppendCommand implements Command {
  constructor(private editor: TextEditor, private text: string) {}
  execute() { this.editor.content += this.text; }
  undo() { this.editor.content = this.editor.content.slice(0, -this.text.length); }
}

class History {
  private stack: Command[] = [];
  run(cmd: Command) { cmd.execute(); this.stack.push(cmd); }
  undo() { this.stack.pop()?.undo(); }
}

const editor = new TextEditor();
const history = new History();
history.run(new AppendCommand(editor, "Hello"));
history.run(new AppendCommand(editor, " World"));
console.log(editor.content); // Hello World
history.undo();
console.log(editor.content); // Hello
```

**Applicability.**
- You want to parameterize objects with operations.
- You need to queue, schedule, or execute operations remotely.
- You need reversible operations (undo/redo) — store executed commands for `undo()`.

**Pros / Cons.**
- ➕ Single Responsibility & Open/Closed; enables undo/redo, deferred and queued execution, composing simple commands into macros.
- ➖ More classes/indirection between sender and receiver.

**Relations.**
- Chain of Responsibility, Command, Mediator, and Observer are all ways to connect senders and receivers.
- Commands are often stored for Memento-based undo, or assembled into Composite "macro" commands.
- A Command can be queued for later execution (job queues).

**Pitfalls.** For trivial callbacks, a plain function/closure is enough — Command pays off when you need undo, queuing, logging, or serialization of operations.

---

## Iterator

**Intent.** Provide a way to access the elements of a collection sequentially without exposing its underlying representation (array, tree, hash, etc.).

**Problem.** Different collections store data differently. Client code that traverses them gets coupled to each structure, and adding traversal logic bloats the collection class. You want a uniform traversal interface.

**Solution.** Extract traversal into a separate `Iterator` object that knows how to walk a particular collection and tracks the current position. Clients call `next()`/`hasNext()` (or use the language's iteration protocol) and never see the internals. A collection can offer multiple iterators (forward, reverse, depth-first).

**Structure (described).**
- `Iterator` — interface with `next()` / `hasNext()` (or yields values).
- `ConcreteIterator` — implements traversal of one collection; tracks position.
- `IterableCollection` — interface with a method to create an iterator.
- `ConcreteCollection` — returns the appropriate iterator.

```ts
class TreeNode<T> {
  children: TreeNode<T>[] = [];
  constructor(public value: T) {}
}

// Depth-first iterator using the JS iteration protocol.
class TreeCollection<T> implements Iterable<T> {
  constructor(private root: TreeNode<T>) {}
  *[Symbol.iterator](): Iterator<T> {
    function* walk(node: TreeNode<T>): Generator<T> {
      yield node.value;
      for (const child of node.children) yield* walk(child);
    }
    yield* walk(this.root);
  }
}

const root = new TreeNode("a");
root.children.push(new TreeNode("b"), new TreeNode("c"));
for (const v of new TreeCollection(root)) console.log(v); // a, b, c
```

**Applicability.**
- Your collection has a complex internal structure you want to hide.
- You want to reduce duplication of traversal code, or support several traversal strategies.
- You want a uniform traversal interface across different collection types.

**Pros / Cons.**
- ➕ Single Responsibility & Open/Closed; iterate the same collection in parallel with independent iterators; pause/resume traversal.
- ➖ Overkill for simple collections; a dedicated iterator can be less efficient than direct access.

**Relations.**
- Iterator traverses Composite trees; Visitor often uses an iterator to walk the structure.
- Can use a Factory Method to let collections decide which iterator to return.

**Pitfalls.** In TS/JS, prefer the built-in iteration protocol (`Symbol.iterator`, generators, `for...of`). Hand-rolled `next()/hasNext()` classes are rarely needed; implement the protocol instead.

---

## Mediator

**Intent.** Reduce chaotic dependencies between objects by forcing them to collaborate only through a mediator object.

**Problem.** A set of objects all reference and call each other directly (e.g. form fields that enable/disable one another). This `n×n` web of dependencies is rigid, hard to reuse, and any change ripples everywhere.

**Solution.** Stop components from talking to each other directly. Route their communication through a `Mediator`. Each component knows only the mediator and notifies it of events; the mediator decides who else to involve. Components become reusable and decoupled; coordination logic lives in one place.

**Structure (described).**
- `Mediator` — interface for notifications from components.
- `ConcreteMediator` — coordinates components; holds references to them.
- `Component` — holds a reference to the mediator; notifies it instead of peers.

```ts
interface Mediator { notify(sender: string, event: string): void; }

class Button {
  constructor(private mediator: Mediator, private name: string) {}
  click() { this.mediator.notify(this.name, "click"); }
}
class TextBox { enabled = true; }

class DialogMediator implements Mediator {
  constructor(public textbox: TextBox) {}
  notify(sender: string, event: string): void {
    if (sender === "lock" && event === "click") {
      this.textbox.enabled = !this.textbox.enabled; // coordinates peers
    }
  }
}

const textbox = new TextBox();
const mediator = new DialogMediator(textbox);
new Button(mediator, "lock").click();
console.log(textbox.enabled); // false
```

**Applicability.**
- It's hard to change some classes because they're tightly coupled to many others.
- You can't reuse a component because it depends on too many other components.
- You're subclassing components just to vary how they coordinate in different contexts.

**Pros / Cons.**
- ➕ Single Responsibility & Open/Closed; reduces coupling; coordination logic centralized and reusable.
- ➖ The mediator can grow into a *god object* that knows and controls everything.

**Relations.**
- Mediator and Facade both centralize, but Facade only *simplifies access* to a subsystem that doesn't know it exists; Mediator *coordinates* peers that depend on it bidirectionally.
- Mediator vs Observer: Observer distributes one-way state-change notifications among loosely coupled objects; Mediator encapsulates the coordination itself. They're sometimes combined (the mediator publishes events).

**Pitfalls.** Watch for the mediator absorbing all logic. Split large mediators by concern; the goal is *less* coupling, not a single omniscient controller.

---

## Memento

**Intent.** Capture and externalize an object's internal state so it can be restored later — without violating encapsulation.

**Problem.** You want undo, snapshots, or checkpoints. To save state you'd need to read all of an object's fields, but making them public breaks encapsulation and couples the snapshot code to the object's internals.

**Solution.** The object (the *originator*) produces a *memento* — an opaque snapshot of its own state. Only the originator can read the memento's contents; everyone else (a *caretaker* like a history list) just stores and passes mementos around without inspecting them. To undo, the originator restores from a memento.

**Structure (described).**
- `Originator` — creates a memento of its state and can restore from one.
- `Memento` — stores the snapshot; exposes full state only to the originator.
- `Caretaker` — keeps mementos (e.g. an undo stack) but never reads their internals.

```ts
class EditorMemento {
  constructor(private readonly state: string) {}
  getState(): string { return this.state; } // intended for the originator
}

class Editor {
  private text = "";
  type(words: string) { this.text += words; }
  getText() { return this.text; }
  save(): EditorMemento { return new EditorMemento(this.text); }
  restore(m: EditorMemento) { this.text = m.getState(); }
}

class History {
  private mementos: EditorMemento[] = [];
  push(m: EditorMemento) { this.mementos.push(m); }
  pop(): EditorMemento | undefined { return this.mementos.pop(); }
}

const editor = new Editor();
const history = new History();
editor.type("Hello");
history.push(editor.save());
editor.type(" World");
console.log(editor.getText()); // Hello World
const last = history.pop();
if (last) editor.restore(last);
console.log(editor.getText()); // Hello
```

**Applicability.**
- You want to produce snapshots of an object's state to restore it later (undo, transactions, checkpoints).
- Direct field access would break the object's encapsulation.

**Pros / Cons.**
- ➕ Snapshot/restore without exposing internals; simplifies the originator (it isn't responsible for the history).
- ➖ High memory cost if clients snapshot too often; caretakers must manage memento lifecycles.

**Relations.**
- Command + Memento: store a memento before executing a command to enable undo.
- Iterator can use a Memento to capture iteration state.
- Prototype can be a simpler alternative when the object's state is easily copyable.

**Pitfalls.** True interface-level "only originator can read" encapsulation is hard in TS (no nested-class friendship). A common pragmatic approach: keep the memento a plain immutable snapshot and rely on convention/typing to keep callers from depending on its shape.

---

## Observer

**Intent.** Define a one-to-many dependency so that when one object (the *subject*) changes state, all its dependents (*observers*) are notified automatically.

**Problem.** Many objects need to react to another object's state changes (a price drops; a file finishes downloading). Polling wastes resources; hard-wiring every interested party into the subject couples them tightly and isn't extensible.

**Solution.** Give the subject a list of subscribers and methods to `subscribe()`/`unsubscribe()`. When its state changes, the subject loops over subscribers and calls a common `update()` method. Subjects and observers depend only on a small interface, so observers can be added/removed at runtime without touching the subject.

**Structure (described).**
- `Subject` (Publisher) — holds subscribers; offers subscribe/unsubscribe/notify.
- `Observer` (Subscriber) — interface with `update(data)`.
- `ConcreteObserver` — reacts to notifications.

```ts
interface Observer { update(event: string): void; }

class NewsAgency {
  private observers: Observer[] = [];
  subscribe(o: Observer) { this.observers.push(o); }
  unsubscribe(o: Observer) { this.observers = this.observers.filter(x => x !== o); }
  publish(news: string) { this.observers.forEach(o => o.update(news)); }
}

class EmailSubscriber implements Observer {
  constructor(private name: string) {}
  update(event: string) { console.log(`${this.name} got: ${event}`); }
}

const agency = new NewsAgency();
const alice = new EmailSubscriber("Alice");
agency.subscribe(alice);
agency.subscribe(new EmailSubscriber("Bob"));
agency.publish("Breaking news!"); // Alice got..., Bob got...
agency.unsubscribe(alice);
```

**Applicability.**
- Changes to one object's state require changing others, and you don't know how many objects in advance.
- Some objects must observe others only for a limited time or under specific conditions.

**Pros / Cons.**
- ➕ Open/Closed: add new subscribers without changing the publisher; establish relations at runtime.
- ➖ Subscribers are notified in an undefined order; careless use causes update storms, memory leaks (forgotten unsubscribes), and hard-to-trace cascades.

**Relations.**
- Underpins event systems, pub/sub, MVC, and reactive libraries (RxJS).
- Mediator vs Observer: Observer distributes one-way notifications; Mediator coordinates peers bidirectionally. They're sometimes combined.

**Pitfalls.** Always unsubscribe to avoid leaks. In TS, native events / `EventTarget` / signals / reactive libraries are idiomatic implementations — you rarely hand-roll the full pattern.

---

## State

**Intent.** Allow an object to alter its behavior when its internal state changes — it appears to change its class.

**Problem.** An object behaves very differently depending on a `status` field, and its methods are full of large `switch`/`if` blocks on that field (a document that is Draft / Moderation / Published). Adding a state means editing every method; the conditionals sprawl.

**Solution.** Extract each state into its own class implementing a common `State` interface. The original object (*context*) holds a reference to a current state object and delegates state-dependent behavior to it. States can trigger transitions by swapping the context's current state. Behavior is now organized per state, not scattered across conditionals.

**Structure (described).**
- `Context` — holds a `State`; delegates behavior to it; exposes a method to change state.
- `State` — interface for state-specific behavior.
- `ConcreteState` — implements behavior for one state; may transition the context to another state.

```ts
interface State { publish(doc: Document): void; }

class Draft implements State {
  publish(doc: Document) { doc.setState(new Moderation()); console.log("-> moderation"); }
}
class Moderation implements State {
  publish(doc: Document) { doc.setState(new Published()); console.log("-> published"); }
}
class Published implements State {
  publish(_doc: Document) { console.log("already published"); }
}

class Document {
  private state: State = new Draft();
  setState(s: State) { this.state = s; }
  publish() { this.state.publish(this); }
}

const doc = new Document();
doc.publish(); // -> moderation
doc.publish(); // -> published
doc.publish(); // already published
```

**Applicability.**
- An object behaves differently per state, the number of states is large, and state-specific code changes often.
- A class is polluted with massive conditionals based on the object's current values.

**Pros / Cons.**
- ➕ Single Responsibility (one class per state); Open/Closed; eliminates bulky state conditionals.
- ➖ Overkill if there are only a couple of states that rarely change.

**Relations.**
- State is structurally like Strategy (context delegates to a swappable object), but **intent differs**: Strategy's algorithms are independent and unaware of each other; State's states *know about and trigger transitions* between each other.
- Can be seen as an extension of Strategy where strategies switch each other.

**Pitfalls.** If states never transition between themselves and the caller always picks the behavior, you actually want Strategy. State earns its place when transition logic itself is complex.

---

## Strategy

**Intent.** Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently of clients that use it.

**Problem.** A class supports several variants of an algorithm (sorting orders, routing modes, payment methods, compression schemes) selected via conditionals. The class grows huge, and every new variant means editing it and risking the others.

**Solution.** Extract each algorithm into its own class implementing a common `Strategy` interface. The *context* holds a reference to a strategy and delegates the work to it, without knowing which concrete algorithm it is. Clients pick and inject the strategy; you can swap it at runtime.

**Structure (described).**
- `Strategy` — interface declaring the algorithm method.
- `ConcreteStrategy` — one implementation of the algorithm.
- `Context` — holds a strategy reference; delegates to it; lets clients replace it.

```ts
interface RouteStrategy { build(a: string, b: string): string; }

class DrivingStrategy implements RouteStrategy {
  build(a: string, b: string) { return `Drive: ${a} -> ${b} via roads`; }
}
class WalkingStrategy implements RouteStrategy {
  build(a: string, b: string) { return `Walk: ${a} -> ${b} via paths`; }
}

class Navigator {
  constructor(private strategy: RouteStrategy) {}
  setStrategy(s: RouteStrategy) { this.strategy = s; }
  route(a: string, b: string) { return this.strategy.build(a, b); }
}

const nav = new Navigator(new DrivingStrategy());
console.log(nav.route("Home", "Work")); // Drive: ...
nav.setStrategy(new WalkingStrategy());
console.log(nav.route("Home", "Work")); // Walk: ...
```

**Applicability.**
- You want to use different variants of an algorithm and switch between them at runtime.
- You have many similar classes differing only in how they perform some behavior.
- You want to isolate algorithm logic from the code that uses it, and remove a big conditional that selects behavior.

**Pros / Cons.**
- ➕ Swap algorithms at runtime; isolate implementation details; replace inheritance with composition; Open/Closed.
- ➖ Overkill for a couple of rarely-changing algorithms; clients must know the strategies to pick one.

**Relations.**
- State, Bridge, Decorator, and Strategy all use composition + delegation but differ in intent.
- Strategy vs State: strategies are independent and unaware of each other; states reference each other and trigger transitions.
- In TS, a strategy is often just a *function* passed in — no class hierarchy needed.

**Pitfalls.** Don't build a class hierarchy when a first-class function would do. `(a, b) => string` injected into the context is an idiomatic, lighter Strategy in TS.

---

## Template Method

**Intent.** Define the skeleton of an algorithm in a base class and let subclasses override specific steps without changing the algorithm's overall structure.

**Problem.** Several classes implement the same overall procedure with mostly identical code but a few differing steps (data miners reading PDF vs CSV vs DOC: open, parse, analyze, report — only parsing differs). Duplicating the whole procedure invites divergence and bugs.

**Solution.** Put the invariant algorithm structure in a base-class *template method* that calls a sequence of step methods. Implement common steps in the base; declare the varying ones as abstract (subclasses must implement) or as overridable hooks (optional). Subclasses customize steps but cannot alter the algorithm's structure.

**Structure (described).**
- `AbstractClass` — defines the `templateMethod()` (the fixed sequence) and declares abstract/hook step methods.
- `ConcreteClass` — overrides the varying steps.

```ts
abstract class DataMiner {
  // Template method: fixed skeleton, not overridable.
  mine(path: string): string {
    const raw = this.openFile(path);
    const data = this.parse(raw);
    return this.report(data);
  }
  protected openFile(path: string): string { return `bytes of ${path}`; }
  protected report(data: string): string { return `Report: ${data}`; }
  // Varying step:
  protected abstract parse(raw: string): string;
}

class CsvMiner extends DataMiner {
  protected parse(raw: string) { return `csv-rows(${raw})`; }
}
class PdfMiner extends DataMiner {
  protected parse(raw: string) { return `pdf-text(${raw})`; }
}

console.log(new CsvMiner().mine("a.csv")); // Report: csv-rows(bytes of a.csv)
console.log(new PdfMiner().mine("b.pdf")); // Report: pdf-text(bytes of b.pdf)
```

**Applicability.**
- You want clients to extend only particular steps of an algorithm, not its structure.
- You have several classes with almost identical algorithms differing in a few steps — pull the duplication into a base class.

**Pros / Cons.**
- ➕ Reuse the common algorithm; let subclasses override only specific parts.
- ➖ Limited by the skeleton you provide; the inheritance link is rigid; many subclasses can be hard to follow (the "inverted control" / "don't call us, we'll call you" flow).

**Relations.**
- Template Method is based on *inheritance* (vary parts of an algorithm via subclassing); Strategy is based on *composition* (swap the whole algorithm via an injected object). Strategy is more flexible at runtime; Template Method is simpler when variation is class-level.
- Factory Method is often one step of a Template Method.

**Pitfalls.** Inheritance couples subclasses to the base's evolution. If steps need to vary at runtime or be combined freely, prefer Strategy. Avoid deep template hierarchies.

---

## Visitor

**Intent.** Separate algorithms from the object structure on which they operate, letting you add new operations without modifying the element classes.

**Problem.** You have a stable set of element classes (nodes of an AST, shapes in a document) and need to run many *unrelated* operations over them (export to XML, compute area, render). Adding each operation as a method to every element class bloats them and mixes unrelated concerns.

**Solution.** Move each operation into a separate `Visitor` object with a `visitX()` method per element type. Elements expose an `accept(visitor)` method that calls back the matching `visit` method (*double dispatch*) — this routes to the right method based on both the element's and the visitor's concrete type. To add a new operation, write a new visitor; element classes stay untouched.

**Structure (described).**
- `Visitor` — interface with a `visit` method per concrete element type.
- `ConcreteVisitor` — implements one operation across all element types.
- `Element` — interface with `accept(visitor)`.
- `ConcreteElement` — implements `accept` by calling `visitor.visitThisType(this)`.

```ts
interface Shape { accept(v: ShapeVisitor): string; }
interface ShapeVisitor {
  visitCircle(c: Circle): string;
  visitRect(r: Rect): string;
}

class Circle implements Shape {
  constructor(public radius: number) {}
  accept(v: ShapeVisitor) { return v.visitCircle(this); }
}
class Rect implements Shape {
  constructor(public w: number, public h: number) {}
  accept(v: ShapeVisitor) { return v.visitRect(this); }
}

// New operation = new visitor, no edits to shapes.
class AreaVisitor implements ShapeVisitor {
  visitCircle(c: Circle) { return `circle area ${(Math.PI * c.radius ** 2).toFixed(1)}`; }
  visitRect(r: Rect) { return `rect area ${r.w * r.h}`; }
}

const shapes: Shape[] = [new Circle(2), new Rect(3, 4)];
const area = new AreaVisitor();
console.log(shapes.map(s => s.accept(area)));
```

**Applicability.**
- You need to perform many distinct, unrelated operations over all elements of a complex object structure.
- The element classes rarely change but the operations on them change/grow often.

**Pros / Cons.**
- ➕ Open/Closed for *operations*: add new behavior without touching element classes; gather related behavior in one visitor.
- ➖ Closed for *elements*: every new element type forces updating every visitor.
- ➖ Visitors may need access to element internals, weakening encapsulation.

**Relations.**
- Visitor is often combined with Composite and Iterator to apply an operation across a whole tree.
- Think of Visitor as a powerful Command that runs across a set of object classes.

**Pitfalls.** Visitor is a heavy pattern. It's worth it only when element types are *stable* and operations multiply. If you add element types frequently, the visitor's "update every visitor" cost makes it a poor fit.

---

## Interpreter *(brief)*

**Intent.** Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.

**Problem.** You repeatedly evaluate expressions of a small, well-defined language (arithmetic, boolean rules, simple query/DSL) and want a structured, extensible way to represent and evaluate them.

**Solution.** Model each grammar rule as a class. *Terminal* expressions (literals, variables) and *non-terminal* expressions (operations composing sub-expressions) all implement a common `interpret(context)` method. A sentence becomes an abstract syntax tree of these expression objects; evaluating it is a recursive `interpret()` over the tree.

```ts
interface Expr { interpret(ctx: Record<string, number>): number; }

class Num implements Expr {
  constructor(private value: number) {}
  interpret() { return this.value; }
}
class Variable implements Expr {
  constructor(private name: string) {}
  interpret(ctx: Record<string, number>) { return ctx[this.name] ?? 0; }
}
class Add implements Expr {
  constructor(private left: Expr, private right: Expr) {}
  interpret(ctx: Record<string, number>) { return this.left.interpret(ctx) + this.right.interpret(ctx); }
}

// (x + 5)
const expr = new Add(new Variable("x"), new Num(5));
console.log(expr.interpret({ x: 10 })); // 15
```

**Applicability.** A simple, stable grammar you must interpret often. Each tree node is a Composite-like expression.

**Pros / Cons.** ➕ Easy to change/extend the grammar (add expression classes); each rule is isolated. ➖ Complex grammars produce an unwieldy class explosion — for anything nontrivial, use a real parser/parser-generator instead.

**Relations.** The expression tree is a Composite; traversal can use Iterator and Visitor (e.g. a visitor that evaluates or pretty-prints).

**Pitfalls.** Rarely the right tool for production parsing — it doesn't scale to large grammars. Reach for established parsing tools instead, and keep Interpreter for tiny embedded DSLs.
