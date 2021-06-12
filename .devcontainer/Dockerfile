# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.158.0/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# Upgrade to NPM 7
RUN su node -c "npm install -g npm@7"
RUN sudo apt-get update \
  # GPG: allows sharing of GPG keys with local machine
  && sudo apt-get install gnupg2 -y \
  # npm-check-updates: a utility that allows for checking all packages for updates (good for security)
  && su node -c "npm install -g npm-check-updates"
