# Voting server for Govern

[![CI Code Quality](https://github.com/jakawell/govern/actions/workflows/ci.yml/badge.svg)](https://github.com/jakawell/govern/actions/workflows/ci.yml)

This is the server for receiving and processing actual votes. This is an isolated, bare-bones
system that only handles the following:

1. Receiving and managing voter registration of public keys
2. Receiving and distributing ballots
3. Receiving signed votes

All other behavior expected of a modern software system is handled in a separate application. There
is no authentication system other than the public key pair registration system (no user accounts).

This is the highest security component of the system and must be literally perfect, so it is
isolated and kept as simple as possible to simplify vetting and verification of its correctness.
