# RPC (Remote Procedure Call)

Remote Procedure Call (RPC) is a protocol that enables a program to request a service from a program located on another computer in a network, without having to understand the network's details. The RPC model makes distributed computing as straightforward as calling a local function.

## How RPC Works

At its core, RPC follows these basic steps:

1. **Client Invocation**: A client application calls a procedure on a remote server.
2. **Parameter Marshalling**: The client's parameters are packaged (marshalled) into a format suitable for transmission.
3. **Network Transport**: The request is sent across the network to the server.
4. **Server Execution**: The server unpacks the parameters and executes the requested procedure.
5. **Result Return**: The server sends the results back to the client following the same process in reverse.

```
Client                              Server
  |                                   |
  |--- Request (procedure call) ----->|
  |                                   | Execute procedure
  |<---- Response (return value) -----|
  |                                   |
```

## Key Features of RPC

### Transparency
RPC aims to make remote procedure calls appear as local calls, abstracting away the complexity of network communication.

### Synchronization
Traditional RPC calls are synchronous - the client waits for the server to complete the procedure and return results before continuing.

### Protocol Independence
RPC can work over various transport protocols, including TCP/IP, UDP, and HTTP.

### Language Neutrality
While implementations vary, RPC can connect services written in different programming languages.

## RPC in Blockchain Networks

In blockchain technology, RPC interfaces serve as the primary method for applications to interact with blockchain nodes. Most blockchain networks, including Ethereum and Bitcoin, provide RPC APIs that allow developers to:

- Query blockchain data (account balances, transaction history)
- Submit transactions to the network
- Deploy and interact with smart contracts
- Monitor network status and events

## HashKey Chain RPC & Node Provider

[HashKey Chain](https://documentation-1oqt.vercel.app/docs/Build-on-HashKey-Chain/RPC-Node-Provider) relies on a decentralized network of RPC nodes that enable developers to interact with the blockchain. These RPC endpoints allow applications to communicate with the HashKey Chain network without running a full node.

### Running Your Own HashKey Chain Node

Self-hosting a HashKey Chain node provides improved reliability, privacy, and control over your blockchain interactions. Based on the [official documentation](https://documentation-1oqt.vercel.app/docs/Build-on-HashKey-Chain/RPC-Node-Provider), here are the key requirements:

#### Prerequisites
* Git
* Docker and Docker Compose
* OpenSSL
* Access to an Ethereum L1 RPC endpoint
* Access to an Ethereum L1 Beacon endpoint
* Minimum system requirements:  
   * 16GB RAM  
   * 4 CPU cores  
   * 1TB SSD storage (for archive node)  
   * 500GB SSD storage (for full node)

#### Basic Setup Process
```bash
# Clone the repository
git clone https://github.com/alt-research/opstack-fullnode-sync
cd opstack-fullnode-sync
git checkout -b branch-v1.2.0 v1.2.0

# Generate JWT secret
openssl rand -hex 32 > ./jwt.txt

# Configure environment variables in .env file
# Start the node
docker compose up -d
```

## Popular RPC Implementations

### JSON-RPC
A stateless, lightweight protocol that uses JSON for data formatting. 

### gRPC
Google's high-performance, open-source universal RPC framework that uses Protocol Buffers for serialization.

### XML-RPC
An older RPC protocol that uses XML for encoding calls and HTTP as the transport mechanism.

## Advantages of RPC in Blockchain

1. **Standardized Access**: Provides a consistent interface for applications to interact with the blockchain
2. **Decentralized Interaction**: Allows applications to connect to multiple nodes for improved reliability
3. **Developer Accessibility**: Simplifies blockchain integration using familiar programming paradigms
4. **Service Separation**: Enables clear separation between blockchain nodes and applications

## Limitations

1. **Security Concerns**: RPC endpoints need proper security measures to prevent unauthorized access
2. **Network Dependency**: Performance is affected by network latency and reliability
3. **Potential Centralization**: Reliance on a few public RPC providers can create centralization risks

## Best Practices for Using Blockchain RPC

1. **Use Multiple Providers**: Connect to several RPC endpoints for redundancy
2. **Implement Rate Limiting**: Avoid overwhelming public RPC services
3. **Consider Self-Hosting**: Run your own node for critical applications
4. **Secure Your Connections**: Use HTTPS and authentication when possible
5. **Monitor Performance**: Track response times and error rates to ensure reliability

For more detailed information about HashKey Chain's RPC infrastructure and setup instructions, visit their [official documentation](https://documentation-1oqt.vercel.app/docs/Build-on-HashKey-Chain/RPC-Node-Provider).

```javascript
// Example of a simple JSON-RPC request to get the latest block number
const response = await fetch('https://rpc.mainnet.hsk.xyz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_blockNumber',
    params: []
  })
});
const data = await response.json();
console.log('Current block:', parseInt(data.result, 16));
``` 