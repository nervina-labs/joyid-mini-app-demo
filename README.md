## JoyID Passkey Wallet Telegram Mini App Demo 

**Please open telegram to find the [JoyIDBot](https://t.me/JoyIDBot) to experience the miniapp in Testnet**

This Bot is designed for developers, showcasing how to integrate the [JoyID Passkey Wallet](https://joy.id/) into your miniapp. With our solution, users can seamlessly use decentralized wallets, accessing miniapp services without any barriers. 

### Quick Start

1. Installation

```
pnpm install
```

2. Update `CALLBACK_SERVER_URL` and `JOYID_APP_URL` in `env/index.ts`

> The `CALLBACK_SERVER_URL` is your own server url and detailed information will be shown below

3. Build and Test

```
pnpm build
pnpm test
```

### Quick custom your own mini app 

Before starting the next tutorial, [Telegram Apps Integration](https://docs.joy.id/guide/applications/telegram) will help you become familiar with the telegram mini app development framework with JoyID Passkey Wallet.

#### Build JoyID URL

Telegram's internal bots and mini-apps restrict certain client side capabilities, such as WebSocket and Passkey, which are essential for comprehensive wallet functionality. 

So we must use an external browser to implement WebAuthn registration and login, which are also the core functions of JoyID Passkey Wallet and `@joyid/miniapp` will help you to build URL to connect wallet, sign messages and send Ethereum transactions with JoyID Passkey Wallet.

You can find the functions as blow to build JoyID URL and the annotations will be helpful for you

- [`buildConnectTokenAndUrl`](./src/helper/index.ts)
- [`buildSignMsgTokenAndUrl`](./src/helper/index.ts)
- [`buildSendTxTokenAndUrl`](./src/helper/index.ts)

#### Build Your own Server

JoyID Passkey Wallet can obtain the necessary information from the above JoyID connection, signing and sending URL, but the mini app **CAN NOT** get results from JoyID Passkey Wallet directly, so the server is necessary.

When the JoyID Passkey Wallet is connected, the message is signed and the Ethereum transaction is sent successfully, the JoyID Passkey Wallet will send the results to the server through an HTTP Post request, and the telegram mini app will get the results from the server through an HTTP Get request.

The server must provide two APIs to receive results from JoyID Passkey Wallet and send results to telegram mini app.

> You can find this mini app demo APIs [here](./src/api/index.ts)

**1. Receive message from JoyID Passkey Wallet**

- route: "/messages"
- base url: your own server callback url like the above CALLBACK_SERVER_URL
- method: POST
- request: 
```js
{
  token: string
  message: json string
}
```
- response: None

For example: 

- The request of connection JoyID Passkey Wallet
```json
{
  "token":"conncd6f828cfb86eba318e4f85733c9178fd6c7c45256034604f67463c36282d2cc9e4ab642",
  "message":"{\"address\":\"0x8ac36d0e764FF17dcF13b2465e77b4fe125EC2bC\"}"
}
```

**2. Telegram mini app get message from server**

- route: "/messages/:token"
- base url: your own server callback url like the above CALLBACK_SERVER_URL
- method: GET
- response: 

```json
{
  message: json string
}
```
For example: 

- GET url: `{your_server_url}/messages/conncd6f828cfb86eba318e4f85733c9178fd6c7c45256034604f67463c36282d2ccc7dfd7f9`

- The response of connection JoyID Passkey Wallet
```json
{
  "message":"{\"address\":\"0x8ac36d0e764FF17dcF13b2465e77b4fe125EC2bC\"}"
}
```

#### Message Format

The message format is JSON string which you can put any information into the message and this mini app demo message is defined as follows:

> You can find this mini app demo message definition [here](./src/api/index.ts)

- Approve connection
```json
"message":"{\"address\":\"0x8ac36d0e764FF17dcF13b2465e77b4fe125EC2bC\"}"
```

- Reject connection
```json
"message": "rejected"
```

- Approve signing message
```json
"message":"{\"signature\":\"0xacf1fadf82f619fc5adc8bf956d0312a99f9915bf5b19e5c5e952485308d741347075a4a5d0c4fa8a8784b8ce79d6d68040e028aa1e7e7c5ee82c52bd1982e831b\"}"
```

- Reject connection
```json
"message": "rejected"
```

- Approve signing and sending transaction
```json
"message":"{\"txHash\":\"0x287ac8d53570799d102791781142539613d1468a08c4cdf33b264554ba8b3069\"}"
```

- Reject connection
```json
"message": "rejected"
```