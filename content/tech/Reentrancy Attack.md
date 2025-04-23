# Reentrancy Attack (Smart Contract Vulnerability)

## Introduction

Reentrancy is one of the most well-known and historically impactful vulnerabilities affecting smart contracts, particularly on EVM-compatible blockchains like Ethereum and HashKey Chain. It occurs when a function in a smart contract makes an external call to another (potentially untrusted) contract, and this external contract is able to call back ("re-enter") into the original contract's function *before* the initial invocation of that function has finished executing, specifically before critical state updates (like balance deductions) have occurred.

This allows an attacker to repeatedly execute parts of a function, often draining funds or manipulating state in unintended ways, because the contract's internal accounting hasn't caught up with the effects of the external interaction.

## The Mechanics of a Simple Reentrancy Attack

The classic scenario typically involves a withdrawal function structured incorrectly:

1.  **State Check:** The contract function first checks if the caller (e.g., the attacker) has sufficient balance to withdraw (`require(balances[msg.sender] >= amount)`).
2.  **External Call (Interaction):** The contract then sends Ether (or performs another external call) to the caller's address (`msg.sender.call{value: amount}("")`). This is the crucial point where execution control is temporarily transferred to the recipient contract.
3.  **State Update (Effect):** *After* the external call returns, the contract updates its internal state to reflect the withdrawal (`balances[msg.sender] -= amount`).

**The Vulnerability:** If the `msg.sender` is a malicious contract, its `receive()` or `fallback()` function (which automatically executes upon receiving Ether via `.call`) can immediately call the victim contract's `withdraw` function *again*.

**The Exploitation Loop:**

*   **Call 1:** Attacker calls `withdraw(amount)`. Balance check passes. Ether is sent via `.call`.
*   **Re-Entry:** Attacker's `fallback()` receives Ether and *immediately calls `withdraw(amount)` again*.
*   **Call 2 (inside Call 1):** The victim contract's `withdraw` function is re-entered. Crucially, the `balances[attacker]` *has not yet been updated* from Call 1. The balance check (`require(balances[msg.sender] >= amount)`) *still passes* based on the pre-withdrawal balance.
*   **Ether Sent Again:** The contract sends *another* `amount` of Ether via `.call` to the attacker.
*   **Loop:** The attacker's `fallback()` can trigger this callback loop multiple times within the single initial transaction, constrained only by the available gas.
*   **Final State Update:** Eventually, the nested calls finish. The `balances[msg.sender] -= amount` line from the *first* call (and subsequent calls) executes, but the attacker has already received Ether multiple times, potentially draining the contract.

## The DAO Hack: A Landmark Historical Event

The most infamous example of a reentrancy attack occurred in **June 2016 against "The DAO"** (Decentralized Autonomous Organization). The DAO was an early, complex smart contract intended to operate as a decentralized venture capital fund on Ethereum.

*   **Vulnerability:** A flaw in The DAO's `splitDAO` function, combined with a recursive call structure for withdrawals, allowed an attacker to use a reentrancy exploit similar to the one described above.
*   **Impact:** The attacker repeatedly called the withdrawal function before balances were updated, draining approximately 3.6 million ETH (worth ~$50 million at the time) from The DAO contract.
*   **Consequence:** This event was catastrophic for the nascent Ethereum ecosystem. To recover the funds and mitigate the damage, a majority of the Ethereum community decided to execute a **hard fork** of the blockchain. This fork reversed the effects of the hack, creating the Ethereum (ETH) chain we know today. The original, unaltered chain continued as **Ethereum Classic (ETC)**, where the funds stolen from The DAO remained with the attacker. The DAO hack serves as a stark reminder of the critical need for smart contract security and robust coding patterns.

## Types of Reentrancy

While the simple Ether withdrawal example is classic, reentrancy can manifest in other ways:

*   **Single Function Reentrancy:** The attack described above, where a function calls back into itself before completion.
*   **Cross-Function Reentrancy:** A more subtle form where `Contract A` calls `Contract B`, and `Contract B` calls back into a *different* function in `Contract A`. If this second function modifies state that the *original* function in `Contract A` relies upon *after* the external call, it can lead to unexpected behavior or exploits. This is dangerous because it breaks assumptions about the state remaining constant during an external call.
*   **"Read-only" Reentrancy (Informational Risk):** While `staticcall` prevents state changes in the called contract during the call, a contract making a `staticcall` could still be called back into *if* the initial function makes state changes *after* the `staticcall` based on information potentially outdated by the callback. This is less common as a direct attack vector but highlights the importance of understanding execution flow.

## Mitigation Strategies for Developers

Preventing reentrancy is paramount for secure smart contract development. The primary techniques are:

1.  **Checks-Effects-Interactions (CEI) Pattern:**
    *   **Concept:** This is the most fundamental and widely recommended prevention pattern. Structure your functions to perform all required checks first, then make all necessary internal state changes (effects), and *only then* interact with external contracts.
    *   **How it Works:** By updating internal state (like `balances[msg.sender] -= amount`) *before* the external call (`msg.sender.call{...}`), any attempt by the external contract to re-enter the function will encounter the *updated* state. The initial balance check (`require(...)`) in the re-entrant call will fail because the balance has already been deducted.
    *   **Implementation:** Requires careful function structuring. Always ask: "Does this state variable get updated *after* an external call?" If yes, refactor.

2.  **Reentrancy Guard (Mutex / Lock):**
    *   **Concept:** Use a mutually exclusive lock (mutex) mechanism, typically implemented as a modifier, to prevent a function from being re-entered while it's already executing within the same transaction context.
    *   **Implementation:** A state variable (e.g., a boolean `_locked` or an enum `_status`) tracks whether the contract is currently executing a protected function.
        ```solidity
        // Conceptual Reentrancy Guard Modifier
        contract MyContract {
            uint256 private _status; // 1 = Not Entered, 2 = Entered
            modifier nonReentrant() {
                require(_status != 2, "ReentrancyGuard: reentrant call");
                _status = 2; // Lock before execution
                _; // Execute the function body
                _status = 1; // Unlock after execution
            }

            function guardedWithdraw(uint256 amount) public nonReentrant {
                // Checks
                require(balances[msg.sender] >= amount, "Insufficient balance");

                // Effects (before interaction if possible, following CEI)
                balances[msg.sender] -= amount;

                // Interaction
                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Transfer failed.");

                // Note: Even with the guard, placing Effects before Interactions (CEI) is preferred.
                // The guard primarily prevents unexpected recursive/cross-function calls.
            }
            // ... rest of contract ...
        }
        ```
    *   **Standard Practice:** Use well-audited libraries like OpenZeppelin's `ReentrancyGuard` contract, which provides a robust `nonReentrant` modifier.

3.  **Pull Payments (Less common for simple Ether):** Instead of the contract pushing funds out during a withdrawal call, have the withdrawal function only update internal balances, requiring the user to call a separate `claim` function to pull the funds out. This often implicitly follows CEI.

**What NOT to Rely On (Solely):**

*   **Gas Limits of `.send()` / `.transfer()`:** Previously, `send()` and `transfer()` were recommended as they forwarded a fixed, small gas stipend (2300 gas), usually insufficient for a malicious contract to perform a re-entrant call *and* modify state. However, gas costs can change (e.g., EIPs), and relying on this fixed limit is considered fragile. **Always prioritize CEI or Reentrancy Guards**, even if using low-level `.call`. The primary purpose of the 2300 gas limit was to prevent reentrancy by accident, not as a primary security guarantee against determined attackers.
