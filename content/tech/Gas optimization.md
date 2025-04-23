# Gas Optimization

## Definition

Gas Optimization is the practice of writing smart contract code (typically in Solidity for EVM-compatible chains) to minimize the amount of **gas** consumed during execution. Gas is the unit used to measure the computational effort required to perform operations on the blockchain (e.g., executing opcodes, storing data, making external calls).

## Why Optimize Gas?

*   **Reduce User Costs:** Every transaction on an EVM chain costs gas, paid by the user (or a relayer) in the network's native currency (e.g., HSK on HashKey Chain). Lower gas consumption means lower transaction fees, making dApps more affordable and accessible.
*   **Fit Within Block Gas Limit:** Each block has a maximum amount of gas it can include. Complex transactions or contract deployments consuming too much gas might fail or be impossible to execute. Optimization ensures operations stay within these limits.
*   **Deployment Costs:** Deploying contracts consumes gas. Optimized contracts are cheaper to deploy.
*   **Network Efficiency:** Well-optimized contracts contribute to overall network health by consuming fewer resources per transaction.

## EVM Gas Mechanics Fundamentals

Understanding how the Ethereum Virtual Machine (EVM) charges gas is key:

*   **Opcode Costs:** Each low-level EVM operation (opcode) has a defined gas cost. Arithmetic operations (ADD, MUL) are cheap, while state-changing operations are expensive.
*   **Storage (`SSTORE`, `SLOAD`):** Interacting with contract storage is *very* expensive, especially writing (`SSTORE`) to a non-zero slot for the first time or changing a zero slot to non-zero. Reading (`SLOAD`) is cheaper but still significant. **Minimizing storage reads/writes is often the primary focus.**
*   **Memory (`MSTORE`, `MLOAD`):** Using memory is much cheaper than storage but is transient (cleared after function execution). Gas cost increases non-linearly as memory expands.
*   **Calldata:** Data passed into `external` function calls is stored in `calldata`. It's read-only and the cheapest data location, especially after Ethereum's EIP-2028 update.
*   **External Calls (`CALL`, `DELEGATECALL`, etc.):** Cost gas depending on the called function, value transfer, and whether a new account is created.
*   **Logs (`LOG` Opcodes):** Emitting events costs gas based on the number of topics and data size. Cheaper than storage for broadcasting information.
*   **Contract Creation (`CREATE`, `CREATE2`):** Has a base cost plus cost per byte of deployed code.

## Gas Calculation

`Transaction Fee = Gas Used * Gas Price`


## Common Gas Optimization Techniques (Solidity)

1.  **Storage Optimization:**
    *   **Minimize `SSTORE`:** Avoid writing to storage unless absolutely necessary. Cache storage reads in local `memory` variables if accessed multiple times within a function.
    *   **Data Packing:** Group multiple variables smaller than 32 bytes (e.g., `uint128`, `bool`, `address`) together in structs or sequentially in contract storage. The EVM reads/writes in 32-byte slots, so packing allows multiple reads/writes with fewer `SLOAD`/`SSTORE` operations.
    *   **Use Events for History:** Emit events (`LOG` opcodes) for historical data or notifications instead of storing extensive logs in contract storage.
    *   **Zero vs. Non-Zero:** Changing a storage slot from zero to non-zero costs more gas than non-zero to non-zero or non-zero to zero. Initialize critical variables carefully.

2.  **Memory and Calldata:**
    *   **`memory` vs. `storage`:** Declare variables used only within a function execution as `memory`.
    *   **`calldata` for Arguments:** Use `calldata` instead of `memory` for external function parameters (structs, arrays, bytes) when they are only read and not modified. This avoids an unnecessary copy to memory.

3.  **Loops:**
    *   **Avoid Unbounded Loops:** Loops iterating over dynamically sized arrays stored *in storage* can become extremely expensive or hit block gas limits. Prefer patterns where users withdraw specific items or process data off-chain.
    *   **Optimize Loop Logic:** Minimize storage access *inside* loops. Cache relevant storage values in memory *before* the loop.

4.  **Data Types:**
    *   **Fixed Size Arrays:** Use fixed-size arrays (`uint[N]`) instead of dynamic arrays (`uint[]`) when the size is known and constant.
    *   **`bytes` vs `string`:** Prefer `bytes` over `string` if you don't need UTF-8 validation, as `bytes` can sometimes be manipulated more efficiently. `string` operations can be costly.
    *   **Appropriate Integer Sizes:** While `uint256` aligns with the EVM word size and is often efficient for calculations, using smaller types like `uint128`, `uint64`, etc., allows for effective storage packing. Be mindful of potential casting overhead if mixing sizes heavily in calculations.

5.  **Logic and Control Flow:**
    *   **Short-Circuiting:** Order conditions in `require`, `if`, etc., such that cheaper checks come first (`||`, `&&`).
    *   **Function Modifiers:** Be aware that modifier code is essentially inlined before the function body; avoid expensive operations or multiple storage reads/writes in frequently used modifiers.
    *   **External vs. Public:** Use `external` visibility for functions only intended to be called from outside the contract; it can be slightly cheaper than `public` as arguments are read directly from `calldata`.

6.  **Advanced Techniques:**
    *   **`unchecked { ... }` Blocks:** (Solidity >=0.8.0) Use for arithmetic operations where you are *certain* overflow/underflow cannot occur based on your logic. This skips the default safety checks, saving gas. Use with extreme caution.
    *   **Assembly (`Yul`):** For fine-grained EVM control, use inline assembly (`assembly { ... }`) to potentially optimize specific operations, but requires deep EVM knowledge and increases audit complexity.
    *   **Proxy Patterns (EIP-1167 Minimal Proxy):** Deploying multiple instances of the same logic can be cheaper using minimal proxies that delegate calls to a single implementation contract.

7.  **Tooling:**
    *   **Solidity Optimizer:** Enable the optimizer in your compiler settings (Hardhat, Truffle, Foundry) and experiment with the `runs` parameter. This performs optimizations like inlining functions, common subexpression elimination, etc.
    *   **Gas Reporters:** Use tools like `hardhat-gas-reporter` to measure gas costs of functions during testing.

## Code Examples

**Example 1: Storage Packing**

```solidity
// --- Less Optimized ---
contract Unpacked {
    uint96 public val1; // Occupies slot 0
    uint256 public val2; // Occupies slot 1
    uint96 public val3; // Occupies slot 2 (Needs 3 SSTOREs)
}

// --- Optimized ---
contract Packed {
    uint96 public val1; // Slot 0, Offset 0
    uint96 public val3; // Slot 0, Offset 12 bytes (96 bits)
    // Slot 0, Offset 24 bytes - only 8 bytes free, not enough for address
    address public owner; // Slot 1 (Needs only 2 SSTOREs if initialized together)
    uint256 public val2; // Slot 2
    // Packing val1 and val3 saved one storage slot write initially.
}
```

**Example 2: Caching Storage Reads in Loops**

```solidity
contract LoopOptimization {
    uint256[] public data;
    uint256 public totalSum;

    // --- Less Optimized: Reads length and element in each iteration ---
    function calculateSumSlow() external {
        uint256 _sum = 0;
        // SLOAD for data.length on each iteration
        for (uint i = 0; i < data.length; i++) {
             // SLOAD for data[i] on each iteration
            _sum += data[i];
        }
        totalSum = _sum; // One SSTORE at the end
    }

    // --- Optimized: Cache length and elements ---
    function calculateSumFast() external {
        uint256[] memory _data = data; // Load entire array into memory (1 SLOAD + MSTOREs)
        uint256 _len = _data.length; // Read length from memory
        uint256 _sum = 0;
        for (uint i = 0; i < _len; i++) {
             // MLOAD - much cheaper than SLOAD
            _sum += _data[i];
        }
         totalSum = _sum; // One SSTORE at the end
    }
}
