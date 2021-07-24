# Data access layer 📤

Because of the hyper-sensitive nature of the data used in this application, we must interact with the data model in an
extraordinarily secure way. For that, we stick with the unofficial slogan of this project:

> ***Security through simplicity.***

This means that we cannot use any of the wonderful third-party data interaction libraries out there with their fun DAOs
and easy syntax. 😢 But that doesn't mean things have to be complex and annoying. We use a simple data access layer
design pattern that makes it easy to quickly write queries, reuse ones already made, and still have nice TypeScript
typings for everything.

## Design pattern

Here are the fundamental components of the data access pattern used in the project.

### Business need structure

Each business area can have its own part of the data access layer. This means that the data access layer is split into 
business area files within the `src/dal/` directory. 

### Model types

Because there is no ORM (to keep to the model of simplicity), there are no DAOs. We are using strict-mode TypeScript 
though, so we will always make types for any data models. The trade off here is that we have to manually ensure that 
the types match the data model actually used the data store. So...do that plz.
### Data store

As of the time this sentence was last edited, the data store is an Azure SQL database, but that could always change 
(and maybe already did! The future is an amazing place...). Given the current state though, the functions provided by 
the DAL will make T-SQL queries against the Azure SQL database instance used by the project.

### Data interfaces

But remember that part about change? We don't want to be bound tightly to any given data store, so we will always have 
interfaces for all the DAL classes that define the functions in a store-neutral way. Given a time where we are using 
Azure SQL as our data store, we will provide an implementation for that interface using T-SQL. For example, we may have 
a business-level DAL segment for ballots with an interface called `BallotDal`, and an implementation of that interface 
called `TSqlBallotDal`. Simple enough. If we switch to Postgres data store in the future, we'd create a 
`PostgresBallotDal` implementation, that would be pretty much identical except certain  optimizations or differences 
between T-SQL and PostgreSql. However, if we switched to Mongo, `MongoBallotDal` would have to be pretty unique.

### Dependency injection

For testability, this project relies heavily on dependency injection, and the data access is obviously going to be no 
exception. For any code that needs to use the DAL, inject the necessary fragments into your constructor. That way, your 
code is protected from any data store changes in the future and you can write unit tests with no data dependencies and 
easy mockability. 

## Migrations

Migrations are a pain in the butt. No one likes migrations. They have no friends on the playground, and frankly, they
deserve it. There such a pain that they don't get to just be on sub-point with the rest of the DAL components. They
have to have their own whole-ass section. 😒 

Now that we have that out of the way, how do migrations work? For reasons beyond migrations, the data store for this
project is always going to be "append-only": meaning that nothing is ever removed. So, say you want to rename a column.
You can't actually do that because that would involve creating a new column, copying the data to it, and *deleting the
data from the old column*. That last part is not allowed. But there's an easy enough workaround: Just don't do that last
part. Let the old column stay. Storage is free right? 🤷‍♂️

- Rename: Just add the new column/table and copy the data. Don't remove the old one in the store (you can removed it
from the TypeScript type though).
- Delete: Just don't. You can remove the table/column from the TypeScript typings and no one will be the wiser.
- Add: This is fine. Add columns or tables all you want.

The exception to this is meta-structures. Keys, indexes, and other constraints can be removed or replaced.
