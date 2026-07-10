---
name: software-design-patterns
description: Use when choosing, naming, applying, or refactoring toward a software design pattern — creational, structural, or behavioral (Factory, Builder, Singleton, Adapter, Decorator, Facade, Composite, Strategy, Observer, Command, State, etc.) — or when the user describes a design problem these patterns solve (swap algorithms at runtime, notify many objects, add behavior without subclassing, build complex objects step by step) even if no pattern is named. Covers the 23 Gang of Four (GoF) patterns across creational, structural, and behavioral categories. Based on refactoring.guru.
---

# Software Design Patterns (Gang of Four)

A reference for the 23 classic Gang of Four (GoF) design patterns. Concepts are language-agnostic; examples are in TypeScript. The canonical online reference modeled here is **[refactoring.guru/design-patterns](https://refactoring.guru/design-patterns)** — cite and defer to it for deeper diagrams and per-language variants.

## What design patterns are (and are not)

A design pattern is a **typical, reusable solution to a recurring design problem** in object-oriented software. It is *not*:

- **Not a finished piece of code you copy-paste.** A pattern is a general concept — a description of how to structure classes and objects to solve a problem. You adapt it to your situation and write the code yourself.
- **Not an algorithm.** An algorithm defines a precise sequence of steps to reach a goal. A pattern is a higher-level *blueprint* for structure: you can implement the same pattern many different ways.
- **Not a library or framework.** Patterns describe relationships and responsibilities, not specific APIs.

Think of a pattern as a blueprint you customize, versus an algorithm which is a concrete recipe.

### Why patterns are valuable

- **Shared vocabulary.** Saying "use a Factory here" or "this is a Strategy" communicates an entire design intent in one or two words. Patterns are a vocabulary for design discussions.
- **Proven, time-tested structure.** Patterns are battle-tested solutions; using them helps you avoid subtle problems that surface only later, and reassures reviewers that the approach is sound.
- **They teach you to design for change.** Even when you do not apply a pattern verbatim, knowing them trains you to spot the object-oriented principles (program to an interface, favor composition over inheritance, encapsulate what varies) that make code flexible.

### The danger: overuse

Patterns are tools, not goals. Common failure modes:

- **Forcing patterns where plain code is simpler and clearer.** A pattern adds indirection. If a problem is solved by a function, a `switch`, or a small class, a pattern usually makes it *worse*, not better. Inexperience plus enthusiasm for patterns leads to over-engineered designs.
- **Cargo-culting structure** without understanding the problem each pattern solves. Apply a pattern only when you feel the *pain* it is designed to relieve.
- **Premature abstraction.** Wait until variation actually appears (or is clearly imminent) before introducing the flexibility a pattern provides.

Rule of thumb: reach for a pattern when you recognize its *problem*, not because you want to use the pattern. If a junior could read the simpler version faster and it would not need to change, prefer the simpler version.

## The three categories

The GoF patterns fall into three groups based on *what kind of problem* they address.

| Category | Concern | Reach for it when... |
|---|---|---|
| **Creational** | *How objects get created.* Make object creation flexible, decoupled, and reusable. | **"I need to create objects flexibly"** — control *which* class is instantiated, hide construction details, reuse or limit instances, or build complex objects step by step. |
| **Structural** | *How objects and classes are composed.* Assemble objects into larger structures while keeping them flexible and efficient. | **"I need to compose / assemble objects and classes"** — make incompatible interfaces work together, add responsibilities, wrap or simplify, share data, or treat groups uniformly. |
| **Behavioral** | *How objects interact.* Manage algorithms, responsibilities, and communication between objects. | **"I need to manage algorithms, responsibilities, or communication"** — vary behavior at runtime, decouple senders from receivers, traverse collections, or coordinate many objects. |

### Quick decision guide

1. **Is the problem about *making* objects?** → Creational. (Which concrete class? How is it built? One instance or many?)
2. **Is the problem about *arranging* existing objects into a structure?** → Structural. (How do these pieces fit together? How do I add to or simplify them without rewriting?)
3. **Is the problem about *what objects do and how they talk*?** → Behavioral. (How do they coordinate? How does behavior change over time or context?)

## Pattern index

Each pattern below has a full write-up in the matching `references/` file: **Intent, Problem, Solution, Structure, TypeScript example, Applicability, Pros/Cons, Relations, and Pitfalls.**

### Creational — *flexible object creation* → `references/creational.md`

| Pattern | Intent (one line) | Typical trigger |
|---|---|---|
| **Factory Method** | Define an interface for creating an object, but let subclasses decide which class to instantiate. | You don't know ahead of time which concrete class you need; pick it in a subclass/override. |
| **Abstract Factory** | Create families of related objects without specifying their concrete classes. | You need products that must be used together and come in interchangeable "families" (e.g. UI themes). |
| **Builder** | Construct complex objects step by step; the same process can build different representations. | An object has many optional parts or a telescoping constructor; you want readable, staged construction. |
| **Prototype** | Create new objects by cloning an existing instance. | Creating from scratch is expensive, or you need a copy of an object whose concrete class you don't know. |
| **Singleton** | Ensure a class has exactly one instance with a global access point. | Exactly one shared resource must exist (config, connection pool) — but beware: often an anti-pattern. |

### Structural — *composing objects and classes* → `references/structural.md`

| Pattern | Intent (one line) | Typical trigger |
|---|---|---|
| **Adapter** | Make an incompatible interface usable by wrapping it in an expected one. | You must integrate a class/API whose interface doesn't match what your code expects. |
| **Bridge** | Split an abstraction from its implementation so they vary independently. | A class explodes combinatorially across two independent dimensions (e.g. shape × rendering API). |
| **Composite** | Treat individual objects and compositions of objects uniformly via a tree. | You work with tree structures and want clients to ignore the leaf-vs-branch distinction. |
| **Decorator** | Attach new behaviors by wrapping objects, without subclassing. | You want to add responsibilities to objects dynamically and in combinations. |
| **Facade** | Provide a simple unified interface to a complex subsystem. | A subsystem is hard to use; you want a single, easy entry point for common tasks. |
| **Flyweight** | Share common state across many objects to save memory. | You must create a huge number of similar objects and RAM is the bottleneck. |
| **Proxy** | Provide a stand-in that controls access to another object. | You need lazy loading, access control, caching, logging, or a remote stand-in for an object. |

### Behavioral — *algorithms, responsibilities, communication* → `references/behavioral.md`

| Pattern | Intent (one line) | Typical trigger |
|---|---|---|
| **Chain of Responsibility** | Pass a request along a chain of handlers until one handles it. | Multiple objects might handle a request and you want to decouple sender from receiver. |
| **Command** | Encapsulate a request as an object (params, queue, log, undo). | You need undo/redo, queuing, logging, or to parameterize objects with actions. |
| **Iterator** | Traverse a collection's elements without exposing its internal structure. | You want a uniform way to walk a collection regardless of how it's stored. |
| **Mediator** | Centralize complex communication between objects in a mediator. | A web of objects all reference each other; you want to reduce tangled coupling. |
| **Memento** | Capture and restore an object's state without violating encapsulation. | You need snapshots/undo without exposing internal fields. |
| **Observer** | Notify many dependent objects automatically when one changes state. | One object's state change must be broadcast to many subscribers (events, pub/sub). |
| **State** | Let an object alter its behavior when its internal state changes. | An object behaves like a state machine and is full of `if`/`switch` on a status field. |
| **Strategy** | Define a family of interchangeable algorithms and swap them at runtime. | You want to choose one of several algorithms/behaviors at runtime without conditionals. |
| **Template Method** | Define an algorithm's skeleton, deferring steps to subclasses. | Several variants share an overall procedure but differ in specific steps. |
| **Visitor** | Add new operations to an object structure without changing its classes. | You need to run many unrelated operations over a stable set of element classes. |
| **Interpreter** | Define a grammar and an interpreter for sentences in a language. | You repeatedly interpret expressions of a simple, well-defined language (rare; brief in refs). |

## How to use these references

- Start here for **choosing** a pattern (the category guide and index above).
- For the **full write-up** of any creational pattern (Factory Method, Abstract Factory, Builder, Prototype, Singleton), read `references/creational.md`.
- For the **full write-up** of any structural pattern (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy), read `references/structural.md`.
- For the **full write-up** of any behavioral pattern (Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter), read `references/behavioral.md`.

Each reference opens with its own table of contents. For deeper diagrams, additional language examples, and pseudocode, consult the canonical source: **[refactoring.guru/design-patterns](https://refactoring.guru/design-patterns)**.
