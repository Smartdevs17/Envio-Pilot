# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a> |
  <a href="https://envio-pilot-oz9lju1jy-smartdevs17s-projects.vercel.app/">Live App</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`


## Hackathon Requirements

### 🔐 Advanced Permissions Usage (ERC-7715)
EnvioPilot leverages MetaMask's Advanced Permissions to enable a seamless "Set & Forget" trading experience. Users grant a periodic allowance and execution permission to a session account, which then executes trades on their behalf without requiring manual confirmation for every transaction.

- **Smart Contracts Repository**: [GitHub: envio-pilot-contracts](https://github.com/Smartdevs17/envio-pilot-contracts)
- **Requesting Permissions**: We use `erc7715ProviderActions` to request periodic native token allowances.
  - [Code: Request Permissions](https://github.com/smartdev_x/envio-pilot/blob/main/frontend/packages/nextjs/app/erc-7715-permissions/hooks/usePermissions.ts#L45-L120)
- **Redeeming Permissions**: We use `erc7710BundlerActions` and `sendUserOperationWithDelegation` to execute trades using the granted permissions.
  - [Code: Redeeming Permissions](https://github.com/smartdev_x/envio-pilot/blob/main/frontend/packages/nextjs/app/erc-7715-permissions/hooks/usePermissions.ts#L122-L212)

### 📊 Envio Usage
We use Envio's hyper-fast indexing to power our **AI Agent**, providing users with real-time data about their permissions, trades, and DCA orders.

- **Real-time Awareness**: The AI Agent queries Envio to understand the user's current state (e.g., "What are my active permissions?") and provides personalized trading advice.
- **Event Indexing**: We index `PermissionGranted`, `TradeExecuted`, and `DCAOrderCreated` events.
- **Code Links**:
- [Envio Indexer Configuration](https://github.com/Smartdevs17/envio-pilot-backend/blob/main/config.yaml)
  - [AI Envio Query Service](https://github.com/smartdev_x/envio-pilot/blob/main/frontend/packages/nextjs/services/ai/envioQueryService.ts)

### 💬 Feedback
We've documented our journey and feedback regarding the integration of MetaMask Advanced Permissions and Envio.
- **Journey & Feedback**: [HackMD Feedback](https://hackmd.io/@ellcs/B1pebUlPd)
- **GitHub Issue**: We've opened an issue regarding the need for standardized context management in the `smart-accounts-kit`: [Issue #121](https://github.com/MetaMask/smart-accounts-kit/issues/121)

### 📱 Social Media
Check out our project journey and demonstration on X!

- **Project Journey**:
    - [Main Submission Post](https://x.com/smartdev_x/status/2007208716341514404)
    - [Advanced Permissions Intro](https://x.com/smartdev_x/status/2005097059536568577)
    - [Envio Integration Update](https://x.com/smartdev_x/status/2006083152893338041)
    - [AI Agent Demonstration](https://x.com/smartdev_x/status/2005641417801273592)
    - [DCA Automation Features](https://x.com/smartdev_x/status/2005538922944934001)
    - [Workflow Optimization](https://x.com/smartdev_x/status/2005539987723604112)
    - [Initial Prototype](https://x.com/smartdev_x/status/2004628981471936843)
    - [Community Feedback](https://x.com/smartdev_x/status/2004851164119269895)
    - [Project Kickoff](https://x.com/smartdev_x/status/2002309188513333495)

- **Official Tag**: [@MetaMaskDev](https://x.com/MetaMaskDev)

---

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.