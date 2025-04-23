# 51% Attack

## Definition

A 51% Attack is a potential attack on a blockchain network where a single entity or a coordinated group manages to control **more than 50% of the network's total consensus power**. The specific resource constituting this power depends on the consensus mechanism:

*   **Proof-of-Work (PoW):** >50% of the total network **hashrate** (computational power).
*   **Proof-of-Stake (PoS):** >50% of the total **staked cryptocurrency** (or voting power derived from it).

Controlling the majority of the consensus power grants the attacker significant influence over the block production process.

## Mechanism in Proof-of-Work (PoW)

In PoW chains like Bitcoin (historically Ethereum 1.0):

1.  **Outpacing the Network:** With >50% hashrate, the attacker can reliably find new blocks faster than the rest of the network combined.
2.  **Building a Private Chain:** The attacker can mine a separate, private version of the blockchain, withholding these blocks from the public network.
3.  **Double-Spending:** While the private chain grows, the attacker can spend coins on the *public* chain (e.g., deposit to an exchange).
4.  **Chain Reorganization (Reorg):** Once the attacker's private chain becomes longer than the public chain (which it inevitably will, given majority hashrate), the attacker broadcasts their longer chain.
5.  **Network Consensus Shift:** According to the "longest chain rule" common in PoW, honest nodes will discard the shorter public chain (including the attacker's initial spend) and adopt the attacker's longer chain as the canonical history.
6.  **Outcome:** The attacker's initial spend on the original public chain is effectively reversed (erased from the accepted history), but they retain the goods/services received. The attacker can then spend the *same* coins again on their now-canonical chain.

**What an Attacker *Can* Do (PoW):**
*   Perform double-spends.
*   Prevent specific transactions from gaining confirmation (censorship) by excluding them from their blocks.
*   Prevent other miners from finding blocks (by orphaning them).

**What an Attacker Generally *Cannot* Do (PoW):**
*   Create coins out of thin air (violates consensus rules).
*   Change rules of the protocol (requires code change accepted by nodes).
*   Reverse transactions finalized deep in the blockchain history (computationally prohibitive due to chain length).
*   Steal private keys or funds from arbitrary addresses.

## Mechanism in Proof-of-Stake (PoS)

In PoS chains, controlling >50% of the stake gives an attacker different, potentially more severe, capabilities depending on the specific PoS implementation (especially BFT variants):

1.  **Finalizing Malicious Forks:** In some BFT-style PoS systems, controlling a supermajority (often >66%) of the stake might allow the attacker to finalize a malicious fork containing invalid state transitions, although this is highly dependent on the protocol design and slashing conditions. Controlling >50% might be sufficient to control block proposals reliably.
2.  **Censorship:** The attacker can consistently propose and attest to blocks that exclude specific transactions or addresses.
3.  **Liveness Attack (Halting the Chain):** By refusing to participate or attest to blocks proposed by others, a majority stake holder could potentially halt the chain's progress, preventing new blocks from being finalized. Note: Sometimes only >33% stake is needed to prevent finality in BFT systems if they abstain.
4.  **Double-Spending:** Less straightforward than PoW. It might involve complex coordination to get conflicting blocks finalized or exploiting specific finality gadget vulnerabilities, often requiring >66% stake in BFT-variants. Simple chain overwriting is less common due to different fork-choice rules and finality mechanisms.

**Slashing as a Deterrent:** A critical difference in PoS is the **slashing mechanism**. If an attacker controlling significant stake attempts malicious actions (like signing conflicting blocks), the protocol is designed to detect this and destroy (slash) a large portion of their staked collateral. This makes such attacks extremely expensive and directly impacts the attacker's capital, acting as a stronger economic deterrent compared to the wasted energy cost in PoW.
