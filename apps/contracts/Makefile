# Makefile for Foundry projects

# Load environment variables
include .env
export

# Variables
RPC_URL ?= $(ETHEREUM_RPC_URL)
ETHERSCAN_API_KEY ?= $(ETHERSCAN_API_KEY)

# Ensure PRIVATE_KEY is set
ifeq ($(PRIVATE_KEY),)
$(error PRIVATE_KEY is not set. Please set it in your .env file)
endif

# Commands
.PHONY: all test build deploy verify clean help

all: test

# Run tests
test:
	forge test --fork-url $(RPC_URL)

# Build the project
build:
	forge build

# Deploy the contract
# Usage: make deploy <ContractName>
deploy:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Error: Please provide a contract name. Usage: make deploy <ContractName>"; \
		exit 1; \
	fi
	@echo "Deploying contract: $(filter-out $@,$(MAKECMDGOALS))"
	forge create --rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		src/script/$(filter-out $@,$(MAKECMDGOALS)).sol:$(filter-out $@,$(MAKECMDGOALS))

# Verify the contract on Etherscan
# Usage: make verify <ContractName> <ContractAddress>
verify:
	@if [ -z "$(word 2,$(filter-out $@,$(MAKECMDGOALS)))" ]; then \
		echo "Error: Please provide both contract name and address. Usage: make verify <ContractName> <ContractAddress>"; \
		exit 1; \
	fi
	@echo "Verifying contract: $(word 1,$(filter-out $@,$(MAKECMDGOALS))) at address $(word 2,$(filter-out $@,$(MAKECMDGOALS)))"
	forge verify-contract \
		--chain-id 1 \
		--compiler-version $(shell forge --version) \
		--constructor-args $(shell cast abi-encode "constructor(uint256)" 100) \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--watch \
		$(word 2,$(filter-out $@,$(MAKECMDGOALS))) \
		src/$(word 1,$(filter-out $@,$(MAKECMDGOALS))).sol:$(word 1,$(filter-out $@,$(MAKECMDGOALS)))

# Clean build artifacts
clean:
	forge clean

# Help command to display available targets
help:
	@echo "Available targets:"
	@echo "  test                           - Run tests"
	@echo "  build                          - Build the project"
	@echo "  deploy <ContractName>          - Deploy the specified contract"
	@echo "  verify <ContractName> <Address>- Verify the specified contract on Etherscan"
	@echo "  clean                          - Clean build artifacts"
	@echo "  help                           - Display this help message"
	@echo ""
	@echo "Note: Make sure to set up your .env file with the following variables:"
	@echo "  ETHEREUM_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY"

# This allows passing arguments to the deploy and verify commands
%:
	@:
