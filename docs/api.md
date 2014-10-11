# BitPay API Calls

## Public

To use the public capabilities do not include a token or identity with the client.

### createToken

Creates or claims an access token. If you supply an `id` and `facade` you will receive a `pairingCode` that you can either give to an account owner, or approve the token yourself by authenticating at the *My Account -> API Tokens*. If you already have a `pairingCode`, you can pass both an `id` and `pairingCode` to link your Client ID to the token.

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
id            | Client ID                  | true
pairingCode   | string                     |
facade        | string *(merchant, pos)*   |
label         | string                     |

**Note**: The label is alphanumeric with spaces, underscores and dashes. A Client ID is based on the [bitcoin identity protocol](https://en.bitcoin.it/wiki/Identity_protocol_v1).

Example Params:

```javascript
{
  "id": "Tf4iyFq4hgEf3iVHkeihR9DKPVpqEWF5crd",
  "facade": "merchant"
}
```

Example Response:

```javascript
[
  {
    token: '4bdD1muDaxBydeYHSdNagEy1w44FJftrfftmJ5pLfcXU',
    facade: 'merchant',
    dateCreated: 1411506027126,
    pairingExpiration: 1411592427126,
    pairingCode: 'ww0MuhY',
    policies: [
      {
        policy: 'id',
        method: 'inactive',
        params: [ 'Tf4iyFq4hgEf3iVHkeihR9DKPVpqEWF5crd' ]
      }
    ]
 }
]
```

### getInvoice

Retrieves the specified invoice.

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
invoiceId     | BitPay Invoice ID (string) | true



Example Params:

```javascript

{
  "invoiceId": "MKBena5VPtX1SVwtirJYRa"
}

```

Example Response:

```javascript

{
  url: 'https://sample.com/invoice?id=MKBena5VPtX1SVwtirJYRa',
  status: 'new',
  btcPrice: '0.2260',
  btcDue: '0.2260',
  price: 100,
  currency: 'USD',
  exRates: {
    USD: 442.55566469557
  },
  invoiceTime: 1411506491781,
  expirationTime: 1411507391781,
  currentTime: 1411506524704,
  id: 'MKBena5VPtX1SVwtirJYRa',
  btcPaid: '0.0000',
  rate: 442.56,
  exceptionStatus: false,
  paymentUrls: {
    BIP21: 'bitcoin:n4qa4vHkFG9EK7kB1izSVk1kqK89oVC97o?amount=0.2260',
    BIP72: 'bitcoin:n4qa4vHkFG9EK7kB1izSVk1kqK89oVC97o?amount=0.2260&r=https://sample.com/i/MKBena5VPtX1SVwtirJYRa',
    BIP72b: 'bitcoin:?r=https://sample.com/i/MKBena5VPtX1SVwtirJYRa',
    BIP73: 'https://sample.com/i/MKBena5VPtX1SVwtirJYRa'
  },
  token: 'A8gT6iTyQFWa6tYTAccJfAEJMaJaNEscrrxNzx16yJaHTwNq2kVqSTYvWyngmUp61X'
}

```

**Note**: The `paymentUrls` are *temporary* and will change and not be available after 15 minutes when the invoice expires, or the invoice has been paid.

### getInvoiceBusToken

Will retrieve a token to listen using [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) to payment events for invoices. The token returned will represent a combination of *capabilities* (listening to an event) and *resource* (the invoice).

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
invoiceId     | BitPay Invoice ID (string) | true


Example Params:

```javascript

{
  "invoiceId": "MKBena5VPtX1SVwtirJYRa"
}

```

Example Response:

```javascript
{
  url: 'https://sample.com/events',
  token: '5qkeDrNot4VAUABq6BgdBe6nnq3PPmYiwVhC97eeEupUFao5Vze6NnNxqDXbktB8qy',
  events: [ 'payment' ],
  actions: [ 'subscribe', 'unsubscribe' ]
}
```

You can then use these values to subscribe to a payment event.

Example:

```javascript

var bus = new EventSource( "https://.../events?token=5qkeD..&action=subscribe&events[]=payment" );

bus.onerror = function(e){
  // do something on error
}

bus.addEventListener('connect', function(e){
  // do something on the connect event
});

bus.addEventListener('statechange', function(e){

  var invoice = JSON.parse(e.data);
  // do something with the invoice

});

```

### getRateForCurrency

Retrieves the exchange rate for the given currency.

Example Params:

```javascript
{
  "currency": "USD"
}

```

Example Response:

```javascript
{
  code: 'USD',
  name: 'US Dollar',
  rate: 437.02
}
```

### getRates

Retrieves the list of exchange rates.

Example Response:

```javascript

[
  {
    code: 'USD',
    name: 'US Dollar',
    rate: 437.29 },
  {
    code: 'EUR',
    name: 'Eurozone Euro',
    rate: 340.0488 },
    name: 'Zambian Kwacha',
    rate: 2705.8471 },
  {
    code: 'ZWL',
    name: 'Zimbabwean Dollar',
    rate: 140952.9499
  }
]

```

### getCurrencies

Retrieves the list of supported currencies.

Example Response:

```javascript

[
  {
    code: 'BTC',
    symbol: '฿',
    precision: 4,
    exchangePctFee: 200,
    payoutEnabled: true,
    name: 'Bitcoin',
    plural: 'Bitcoin',
    alts: 'btc',
    payoutFields: [ 'bitcoinAddress' ]
  },
  { code: 'ZWL',
    symbol: 'Z$',
    precision: 2,
    exchangePctFee: 200,
    payoutEnabled: false,
    name: 'Zimbabwean Dollar',
    plural: 'Zimbabwean Dollar',
    alts: '',
    payoutFields: []
  }
]

```

### createAccount

Creates an application for a new merchant account.

Parameters:

Name          | Type          | Required
------------- | ------------- | -------------
users         | array         | true
orgs          | array         | true

Example Params:

```javascript
{
  "users": [{
    "email": "satoshi@sample.com",
    "firstName": "Satoshi",
    "lastName": "Nakamoto",
    "phone": "4041235678",
    "agreedToTOSandPP": "true" // Do you agree to the Terms of Service
  }],
  "orgs": [{
    "name": "Satoshi Widgets",
    "address1": "123 Peachtree St",
    "address2": "Suite 200",
    "city": "Atlanta",
    "state": "GA",
    "zip": "30303",
    "country": "USA",
    "isNonProfit": false, // optional
    "usTaxId": "taxidhere", // optional
    "cartPos": "WooCommerce" //optional
    "affiliateOid": "affiliateoidhere" // optional
    "industry": "Accounting",
  }]
}
```

Example Response:

```javascript
{
  verificationCode: '0.1406255280598998',
  requiredTier: 0,
  accountName: 'Satoshi Widgets',
  contactEmail: 'satoshi@sample.com',
  contactFirstName: 'Satoshi',
  contactLastName: 'Nakamoto',
  contactPhone: '4041235678',
  profileAddress1: '123 Peachtree St',
  profileAddress2: 'Suite 200',
  profileCity: 'Atlanta',
  profileState: 'GA',
  profilePostalCode: '30303',
  profileCountry: 'USA',
  profileIndustry: 'Accounting',
  profileAgreedToTOSandPP: true,
  updated: '2014-09-23T20:31:09.759Z',
  requiresReview: false,
  activated: false,
  verified: false
}
```

## Point-of-Sale

To use the *point-of-sale* capabilities on a *merchant* resource, you'll need to generate a token. These tokens can have individual client restrictions, based on an identity. Additionaly, if you're developing a mobile application, you can generate a token without an individual client restriction that can be used by many clients and can be included with your application. More information below at `Merchant.createPublicPOSToken`.

### createInvoice

Will create an invoice

Parameters:

Name          | Type           | Required
------------- | -------------  | -------------
price         | number         | true
currency      | currency code  | true

Example Params:

```javascript
{
  "price": 100.00,
  "currency": "USD"
}
```

Example Response:

```javascript
{
  url: 'https://sample.com/invoice?id=MKBena5VPtX1SVwtirJYRa',
  status: 'new',
  btcPrice: '0.2260',
  btcDue: '0.2260',
  price: 100,
  currency: 'USD',
  exRates: { USD: 442.55566469557 },
  invoiceTime: 1411506491781,
  expirationTime: 1411507391781,
  currentTime: 1411506491798,
  id: 'MKBena5VPtX1SVwtirJYRa',
  btcPaid: '0.0000',
  rate: 442.56,
  exceptionStatus: false,
  transactions: [],
  paymentUrls: {
    BIP21: 'bitcoin:n4qa4vHkFG9EK7kB1izSVk1kqK89oVC97o?amount=0.2260',
    BIP72: 'bitcoin:n4qa4vHkFG9EK7kB1izSVk1kqK89oVC97o?amount=0.2260&r=https://sample.com/i/MKBena5VPtX1SVwtirJYRa',
    BIP72b: 'bitcoin:?r=https://sample.com/i/MKBena5VPtX1SVwtirJYRa',
    BIP73: 'https://sample.com/i/MKBena5VPtX1SVwtirJYRa'
  },
  token: '8Esi7g1utRuS8USZqrATQechZX9jkmHinQM4rpD76izieEJ8n3AsBczz5EJ24jiiRp'
}
```

**Note**: The `paymentUrls` are *temporary* and will change and not be available after 15 minutes when the invoice expires, or the invoice has been paid.


### getInvoiceSettings

This will return the merchant information and settings for creating invoices.

Example Response:

```javascript
{
  account: '5421f0b9edfb002433004520',
  additionalCurrencies: [ 'USD','EUR','GBP','JPY' ],
  defaultCurrency: 'USD',
  notificationEmail: 'satoshi@sample.com',
  notificationURL: 'https://sample.com/ipn',
  merchantName: 'Satoshis Widgets'
}
```

## Merchant

To use the *merchant* capabilities on a *merchant* resource, you'll need to generate a token. With public capabilities you can create a token and specify *merchant* as the `facade`, and then use the return `pairingCode` to add the token to your account at *My Account -> API Tokens*, or give this `pairingCode` to an merchant organization administrator to add and approve.

### findInvoices

Retrieves invoices for the calling merchant based on the query.

Parameters:

Name          | Type           | Required
------------- | -------------  | -------------
dateStart     | date           | true
dateEnd       | date           |
limit         | number         |
skip          | number         |
itemCode      | string         |
orderId       | string         |

Example Params:

```javascript

{
  "dateStart": "2014-8-1",
  "dateEnd": "2014-8-31"
}


```

Example Response:

```javascript
[
  {
    url: 'https://sample.com/invoice?id=54cbXB29FoNY48hbctAvKy',
    status: 'new',
    btcPrice: '0.2272',
    btcDue: '0.2272',
    price: 100,
    currency: 'USD',
    exRates: { USD: 440.12257441601656 },
    invoiceTime: 1411511759973,
    expirationTime: 1411512659973,
    currentTime: 1411511766879,
    id: '54cbXB29FoNY48hbctAvKy',
    btcPaid: '0.0000',
    rate: 440.12,
    exceptionStatus: false,
    transactions: [],
    paymentUrls: {
      BIP21: 'bitcoin:mndc6N5QPCMUgW378D9Nj5wZEwVQ82HGcd?amount=0.2272',
      BIP72: 'bitcoin:mndc6N5QPCMUgW378D9Nj5wZEwVQ82HGcd?amount=0.2272&r=https://sample.com/i/54cbXB29FoNY48hbctAvKy',
      BIP72b: 'bitcoin:?r=https://sample.com/i/54cbXB29FoNY48hbctAvKy',
      BIP73: 'https://sample.com/i/54cbXB29FoNY48hbctAvKy'
    },
    token: '8Esi7g1utRuS8USZqrATQedEA3nhPhuniWJXBUwMbq546fWrUAkCtTEah2pPB6jeW2'
  }
]
```

**Note**: The `paymentUrls` are *temporary* and will change and not be available after 15 minutes when the invoice expires, or the invoice has been paid.

When there is activity on the invoice the status will change, here is the meaning of each status.

Status          | Description
-------------   | -------------
new             | The invoice has not yet been fully paid
paid            | Received payment however has not yet been fully confirmed
complete        | Payment confirmed by BitPay and invoice has been credited to the ledger
confirmed       | Payment confirmed based on the `transaction` speed settings for the invoice
expired         | Can no longer receive payments
invalid         | The invoice has received payment, however was invalid

When a payment is received, transactions will become available. An invoice can receive a partial payment and an over payment, and in these situations an `exceptionStatus` will be available with `paidPartial` and `paidOver`. It's also possible to accept an over or under payment via the API, and we will go into that below.

```javascript

    exceptionStatus: 'paidPartial',
    transactions:
     [
       {
         amount: 110000,
         confirmations: 0,
         time: '1970-01-01T00:00:00.000Z',
         receivedTime: '2014-09-23T22:51:20.106Z'
       }
     ],

```

### getInvoice

Retrieves a single invoice with additional transaction information.

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
invoiceId     | BitPay Invoice ID (string) | true


Example Params:

```javascript

{
  "invoiceId": "MKBena5VPtX1SVwtirJYRa"
}

```

Example Response:

```javascript
{
  url: 'https://sample.com/invoice?id=YEh2jnoZUAbYMW2XtE44VD',
  status: 'confirmed',
  btcPrice: '0.0023',
  btcDue: '-0.0007',
  price: 1,
  currency: 'USD',
  exRates: { USD: 435.72 },
  invoiceTime: 1411513113810,
  expirationTime: 1411514013810,
  currentTime: 1411515011556,
  id: 'YEh2jnoZUAbYMW2XtE44VD',
  btcPaid: '0.0030',
  rate: 435.72,
  exceptionStatus: 'paidOver',
  transactions: [
    {
      amount: 300000,
      confirmations: 1,
      time: '1970-01-01T00:00:00.000Z',
      receivedTime: '2014-09-23T22:59:22.443Z'
    }
  ],
  token: '8Esi7g1utRuS8USZqrATQeWGCLPqyLpcexbehA7DwDckiiZjj36LdJtSdmXvPZJTUW'
}
```

**Note**: The token returned from this response includes `merchant` capabilities on the `invoice` resource, including being able to make a refund, this is described in further detail below.

### getLedgers

Will return the current balance for each ledger by currency.

Example Response:

```javascript

[
  {
    currency: 'BTC',
    balance: 0.0076
  },
  {
    currency: 'USD',
    balance: 0
  }
]

```

### getLedgerEntries

Will return entries for a given ledger.

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
currency      | currency code (string)     | true
startDate     | date                       | true
endDate       | date                       | true

Example Params:

```javascript
{
  "currency": "BTC",
  "startDate": "2014-9-1",
  "endDate": "2014-9-30"
}
```

Example Response:

```javascript
[
  {
    code: 1000,
    amount: 230000,
    timestamp: '2014-09-24T00:30:18.737Z',
    scale: 100000000,
    txType: 'sale',
    exRates: { USD: 440.52000000000004 },
    buyerFields: {},
    invoiceId: 'Xdmsdo67EUT9M9XVtEL2A3',
    sourceType: 'invoice',
    customerData: { customData: [] },
    invoiceAmount: 1,
    invoiceCurrency: 'USD'
  },
  {
    description: 'overpayment credit',
    code: 1003,
    timestamp: '2014-09-24T00:53:25.594Z',
    amount: 70000,
    notes: 'BTC credit for overpayment of invoice YEh2jnoZUAbYMW2XtE44VD',
    scale: 100000000,
    txType: 'ACH/other',
    exRates: { USD: 435.72 },
    buyerFields: {},
    invoiceId: 'YEh2jnoZUAbYMW2XtE44VD',
    sourceType: 'invoice',
    customerData: { customData: [] },
    invoiceAmount: 1,
    invoiceCurrency: 'USD'
  }
]

```

### createToken

Will approve a token for the callers merchant resource. A `pairingCode` can be retrieved using `public` capabilities, as described above, and can then be added and approved to the callers merchant resource with this call. A `facade` and `pairingCode` are both required, the `facade` method should match the requesters facade as verification of capabilities.

Parameters:

Name          | Type                       | Required
------------- | -------------------------- | -------------
pairingCode   | string                     | true
facade        | facade *(pos, merchant)*   | true


```javascript
{
  "pairingCode": "X8tj3c2",
  "facade": "merchant"
}
```

Example Response:

```javascript
[
  {
    resource: '51rjLjdhZotGsH76hZpdg5j8KAvsWLWXEaww8ynUa7zh',
    token: 'U4Zeh3tKhUwLguxK8r6TAg',
    facade: 'merchant',
    dateCreated: 1411520974852,
    policies: [{
      policy: 'id',
      method: 'require',
      params: ['TfDzkkFs7vTe8yHyb28NDZ56Jt2VBAF3ysd']
    ]}
   }
]
```

### createPublicPOSToken

This will create a token with point-of-sale capabilities *(the ability to create invoices)*. It will *not* be restricted to a specific Client ID, and can be distributed with mobile applications. The token will appear at *My Account -> API Tokens* and can be further managed.

Example Response:

```javascript
[
  {
    policies: [],
    resource: '51rjLjdhZotGsH76hZpdg5j8KAvsWLWXEaww8ynUa7zh',
    token: '5VZPyPQRczUc8HP3EF9Q5jSwNJtVu4nDvEg5u8iqj8eN',
    facade: 'pos',
    dateCreated: 1411519737345
  }
]
```

### Additional
- [getInvoiceBusToken](#getinvoicebustoken) *(see public)*
- [getInvoiceSettings](#getinvoicesettings) *(see point-of-sale)*
- [createInvoice](#createinvoice) *(see point-of-sale)*

## Merchant/Invoice

To use the *merchant* capabilities on an *invoice* resource, you'll need to get a token for the `getInvoice` call, as documented above in the [Merchant](#getinvoice) section. When using this token, the following capabilities will be available for acting upon an invoice.

### refund

Will refund the invoice to any bitcoin address. The invoice will need to have *six confirmations* in the blockchain before a refund can be requested. It's not possible to do a refund while an invoice is partially or overpaid state, see below for more information.

Parameters:

Name               | Type                       | Required
------------------ | -------------------------- | -------------
bitcoinAddress     | bitcoin address (string)   | true
amount             | number                     | true
currency           | currency code (string)     | true

Example Params:

```javascript

{
  "bitcoinAddress": "mtX8nPZZdJ8d3QNLRJ1oJTiEi26Sj6LQXS",
  "amount": 100.00,
  "currency": "USD"
}

```

Example Response:

```javascript

{
  id: 'H9EE8zkSTL5XRCY8pFSf76',
  requestDate: '2014-09-24T00:55:08.347Z',
  status: 'pending',
  token: '6akAeXT66eLfJpCgmAsaT3QLqcXZd1cRseBUSych5KZs7iXAxjLyRvCU8TjMB3DBfw'
}

```

### creditPartialPayment

Will accept a partial payment to complete the payment. Must be done after *six confirmations* and the invoice has been written to the ledger.

Parameters:

Name               | Type                       | Required
------------------ | -------------------------- | -------------
commit             | boolean                    | true

If commit is `true` it will apply the changes, if `false` it will only show the effects of the action.

```javascript
{
  "commit": true
}
```

Example Response:

```javascript

{
  url: 'https://sample.com/invoice?id=8qKF5wGktvwnkGVLmxPgbs',
  status: 'confirmed',
  btcPrice: '0.0010',
  btcDue: '0.0000',
  price: 0.44,
  currency: 'USD',
  exRates: { USD: 426.09000000000003 },
  invoiceTime: 1411586102477,
  expirationTime: 1411587002477,
  currentTime: 1411587051574,
  id: '8qKF5wGktvwnkGVLmxPgbs',
  btcPaid: '0.0010',
  rate: 426.09,
  exceptionStatus: false,
  transactions: [
    {
      amount: 100000,
      confirmations: 2,
      time: '1970-01-01T00:00:00.000Z',
      receivedTime: '2014-09-24T19:17:33.644Z'
    }
  ]
}

```

**Note**: The status has changed to `confirmed`, the `btcPrice` has been adjusted and the `exceptionStatus` has been cleared.

### creditOverpayment

Will accept an over payment to complete the payment. Must be done after *six confirmations*, and the invoice has been written to the ledger.

Parameters:

Name               | Type                       | Required
------------------ | -------------------------- | -------------
commit             | boolean                    | true

If commit is `true` it will apply the changes, if `false` it will only show the effects of the action.

Example Params:

```javascript
{
  "commit": true
}
```

Example Response:

```javascript

{
  url: 'https://sample.com/invoice?id=8KNSxj3m1rcbAWnghSpMKD',
  status: 'complete',
  btcPrice: '0.0023',
  btcDue: '0.0000',
  price: 1,
  currency: 'USD',
  exRates: { USD: 428.33 },
  invoiceTime: 1411588107332,
  expirationTime: 1411589007332,
  currentTime: 1411591834055,
  id: '8KNSxj3m1rcbAWnghSpMKD',
  btcPaid: '0.0023',
  rate: 428.33,
  exceptionStatus: false,
  transactions: [
    {
      amount: 500000,
      confirmations: 6,
      time: '1970-01-01T00:00:00.000Z',
      receivedTime: '2014-09-24T19:49:18.662Z' },
    {
      amount: -270000,
      confirmations: 6,
      time: '2014-09-24T20:50:34.046Z',
      receivedTime: '2014-09-24T20:50:34.046Z'
    }
  ]
}

```

**Note**: The status has changed to `confirmed`, the `btcPaid` has been adjusted, and the additional payment is credited to your ledger.

### getRefunds

Will list the refunds on the invoice.

Example Response:

```javascript
[
  {
    id: '3Ls5s9RfzkN9VtPiTkx8mQ',
    requestDate: '2014-09-24T21:05:17.251Z',
    status: 'pending',
    token: '6akAeXT66eLfJpCgmAsaT3AQ3TpX72kJrMPvHqSDG8BCaGNGGiRuechfsAdtGhgMnk'
  }
]
```

### sendNotification

Will send an IPN notification for the invoice.

Example Response:

```javascript
"Success"
```

