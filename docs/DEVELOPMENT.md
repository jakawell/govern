# Developing for Govern

To ensure that all developers are able to get started quickly with all necessary dependencies, this
project uses a [Visual Studio Code "dev container"](https://code.visualstudio.com/docs/remote/containers).
This means that Code will automatically offer to create a Docker container pre-configured exactly
for this project as soon as you clone it and open the repo in Code. Simply allow it to build, and
it will reopen the project inside that container as soon as it's built. And that's it! You can run
NPM scripts for any of the projects, and start hacking!

## What if I don't want to use VS Code?

Visual Studio Code greatly streamlines the project documentation of this repository, so we highly
recommend it and only explicitly document project setup for it. But if you would rather use another
work flow, you can use the configurations found in the files inside the `.devcontainer` directory
as a guide for what you need to setup.