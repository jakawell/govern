# Developing for Govern

To ensure that all developers are able to get started quickly with all necessary dependencies, this
project uses a [Visual Studio Code "dev container"](https://code.visualstudio.com/docs/remote/containers).
This means that Code will automatically offer to create a Docker container pre-configured exactly
for this project as soon as you clone it and open the repo in Code. Simply allow it to build, and
it will reopen the project inside that container as soon as it's built. And that's it! You can run
NPM scripts for any of the projects, and start hacking!

## Service dependencies

Any external services on which the Govern services depend can be run (or mocked) locally via the 
`development/docker-compose.yml` file. Just `up` it and the locally running Govern services will use those Docker
containers by default.

### sqldata

This container is a Microsoft SQL Server container designed to provide a local sandbox for the Microsoft Azure SQL
Database used in deployments. You can connect to it directly if you like using the
[SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver15)
and connect using the details found in the `docker-compose.yml` file.

## What if I don't want to use VS Code?

Visual Studio Code greatly streamlines the project documentation of this repository, so we highly
recommend it and only explicitly document project setup for it. But if you would rather use another
work flow, you can use the configurations found in the files inside the `.devcontainer` directory
as a guide for what you need to setup.