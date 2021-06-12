#!/usr/bin/env bash

# This script is run in the container after it has been fully created
# Note that is not run as the user, so anything in the .bashrc is not available here

# Setup votes-server
cd votes-server/
npm ci
