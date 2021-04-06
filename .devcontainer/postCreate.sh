#!/usr/bin/env bash

# This script is run in the container after it has been fully created

# Setup votes-server
cd votes-server/
npm ci
