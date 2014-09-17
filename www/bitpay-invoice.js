/**
*
* BitPay Invoice JS
*
* A JavaScript library for BitPay invoices in merchant applications.
* The invoice html element can (optionally) be generated before a BitPay invoice has
* been created and use BitPay bitcoin exchange rates, and it an invoice will be
* created on-the-fly. The invoice, payment buttons, can be integrated into merchant
* application's DOM and payment flow and be styled with CSS, HTML and hooked into
* with JavaScript events for custom behavior.
*
* @example
* var elm = document.getElementByID('invoice');
* var data = {
*   id: invoice.id,
*   price: 10,
*   currency: "USD",
*   btcPrice: invoice.btcPrice,
*   paymentUrls: invoice.paymentUrls,
*   invoiceTime: invoice.invoiceTime,
*   expirationTime: invoice.expirationTime,
*   events: {
*     onpayment: function(){
*       // indicate payment status here
*     }
*     onexpire: function(){
*       // handle expired invoice here
*     }
*   }
* }
* var invoice = new BitpayInvoice( server, params, data );
*
* @param {object} data - Configuration for the invoice as demonstrated in the example.
*/

var BitpayInvoice = function(server, params, data){

  var self = this;

  self.server = server;
  self.elm = document.createElement('div');
  self.data = data;
  self.bus = false;

  self.pubclient = new BitpayRPCClient(server, { facade: 'public' });

  if ( !!params.posToken && !!params.identity ) {
    self.posclient = new BitpayRPCClient(server, params.posToken, params.identity );
  }

  // Default to testnet
  if ( self.data.testnet == undefined ) {
    self.data.testnet = true;
  }

  // Required parameters
  if ( self.data.price == undefined || self.data.currency == undefined ) {
    throw new Error('Please define a price and currency for your invoice.');
  }

  // Cascading events when the invoice is created
  self.elm.addEventListener('invoice', function(){
    // watch the invoice
    self.subscribePaymentEvent();
    self.setToExpire();
  })

  // Expose an event when the invoice is created
  self.oninvoice = new CustomEvent('invoice', {'invoice' : self});
  if ( self.data.events && self.data.events.oninvoice != undefined ) {
    self.elm.addEventListener('invoice', self.data.events.oninvoice );
  }

  // Expose an event when the payment event is subscribed
  self.onsubscribe = new CustomEvent('subscribe', {'invoice' : self});
  if ( self.data.events && self.data.events.subscribe != undefined ) {
    self.elm.addEventListener('subscribe', self.data.events.onsubscribe);
  }

  // Expose an event with the payment event
  self.onpayment = new CustomEvent('payment', {'invoice': self});
  if ( self.data.events && self.data.events.onpayment != undefined ) {
    self.elm.addEventListener('payment', self.data.events.onpayment);
  }

  // Expose an event with the invoice expires
  self.onexpire = new CustomEvent('expire', {'invoice': self});
  if ( self.data.events && self.data.events.onexpire != undefined ) {
    self.elm.addEventListener('expire', self.data.events.onexpire);
  }
  self.elm.addEventListener('expire', function(){
    self.closeBus();
  })

  // Check that the BitPay invoice ID exists
  if ( self.data.id != undefined ) {

    // Check for bitcoin price
    if ( self.data.btcPrice == undefined ) {
      throw new Error('Please define the invoice btcPrice retrieved from the BitPay API.');
    }

    // Check for bitcoin paymentUrls
    if ( self.data.paymentUrls == undefined ) {
      throw new Error('Please define the invoice paymentUrls retrieved from the BitPay API.');
    }

    self.elm.dispatchEvent(self.oninvoice);

  } else {

    // Check for local urls to generate invoices
    if ( self.posclient == undefined ||
         self.pubclient == undefined ) {
      throw new Error('Please define an BitPay RPC clients for creating invoices and getting exchange rate information.');
    }

    // Expose an event when the invoice bitcoin price is updated
    self.onbtcprice = new CustomEvent('btcprice', {'invoice': self});
    if ( self.data.events.onbtcprice != undefined ) {
      self.elm.addEventListener('btcprice', self.data.events.onbtcprice );
    }

    // Stop bitcoin price updates when invoice loaded
    elm.addEventListener('invoice', function(){
      clearInterval(self.updateBtcPriceInterval);
    })

    // Update the bitcoin prices every minute until the invoice is created
    self.updateBtcPrice();
    self.updateBtcPriceInterval = setInterval(function(){
      self.updateBtcPrice();
    }, 60000);
  }

}

/**
 * Dispatches expire event for the invoice
 */
BitpayInvoice.prototype.expireInvoice = function(e){
  var self = e.invoice;
  self.elm.dispatchEvent(this.onexpire);
}

/**
 * Creates a BitPay invoice using a local url/api based on the
 * price and currency defined for the invoice element.
 */
BitpayInvoice.prototype.loadInvoice = function(){
  var self = this;

  var params = {
    price: this.data.price,
    currency: this.data.currency
  }

  self.posclient.request( 'createInvoice', params, function(err, data){
    if ( err ) return console.log(JSON.stringify(err));

    var d = new Date();
    if ( !data.error ) {
      self.data.id = data.invoice.id;
      self.data.btcPrice = data.invoice.btcPrice;
      self.data.paymentUrls = data.invoice.paymentUrls;

      self.data.invoiceTime = data.invoice.invoiceTime;
      self.data.expirationTime = data.invoice.expirationTime;

      // invoice complete
      self.elm.dispatchEvent(self.oninvoice);

    }

  });

}

/**
 * Will open up the users bitcoin wallet
 *
 * @param {string(BIP21|BIP72A|BIP72B|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.openWallet = function(format, system){

  var self = this;

  var openWalletAndroid = function(){
    // Open the bitcoin URL using an android intent

    var intent = {
      action: window.plugins.webintent.ACTION_VIEW,
      url: self.data.paymentUrls[format]
     }

    var success = function(){}
    var fail = function(){
      console.log("Failed to open URL via Android Intent. URL: " + self.data.paymentUrls[format] )
    }

    window.plugins.webintent.startActivity(intent, success, fail);

  }

  var openWalletBrowser = function(){
    // Open the bitcoin URL in an iframe to keep current location state
    var iframe = document.createElement('iframe');
    iframe.src = self.data.paymentUrls[format];
    iframe.style = 'display:none;';
    document.body.appendChild(iframe);
  }


  if ( !system ) {
    var openWallet = openWalletBrowser;
  } else if ( system == 'android' ) {
    var openWallet = openWalletAndroid;
  }

  if ( self.data.id == undefined ) {
    // Create an invoice and then open the wallet
    self.elm.addEventListener('subscribe', openWallet);
    self.loadInvoice()
  } else {
    // Open wallet immediatly
    openWallet();
  }
}

/**
 * Will retreive the latest bitcoin price for the invoice
 *
 * @param {function} callback - The callback function when the prices is retreived
 */
BitpayInvoice.prototype.updateBtcPrice = function(callback){

  var self = this;

  // Check that the BitPay invoice ID is undefined
  if ( this.data.id == undefined ) {

    self.pubclient.request( 'getRateForCurrency', { currency: this.data.currency }, function(){
      if ( !data.err ) {
        self.data.btcPrice = data.btcPrice
        self.elm.dispatchEvent(self.onbtcprice);
        if ( typeof callback === "function" ) {
          callback();
        }
      }
    });

  }
}

/**
 * Close the EventSource event bus
 *
 * @param {event} e - Expire event
 */
BitpayInvoice.prototype.closeBus = function(e){
  var self = e.invoice;
  self.bus.close();
}

/**
 * Will set the invoice to expire based on the expire time defined in the invoice
 */
BitpayInvoice.prototype.setToExpire = function(){
  var self = this;
  var timeToExpire = self.data.expirationTime - self.data.invoiceTime;
  self.setToExpireTimeout = setTimeout(self.expireInvoice, timeToExpire)
}

/**
 * Will open EventSource bus to subscribe to payment events
 */
BitpayInvoice.prototype.subscribePaymentEvent = function(){
  var self = this;

  // Check that there is a BitPay invoice id
  if ( self.data.id == undefined ) {
    throw new Error('This invoice has not been created yet.');
  }

  var openBusAndSubscribe = function(err, response){

    var busToken = response.token;
    var params = 'token='+busToken+'&action=subscribe&events%5B%5D=payment';

    self.bus = new EventSource( response.url + '?' + params );

    self.bus.onerror = function(err){
      throw new Error('There was a bus error:' + err.data);
    }

    self.bus.addEventListener('connect', function(event){
      self.elm.dispatchEvent(self.onsubscribe);
    })

    self.bus.addEventListener('statechange', function(event){
      var message = JSON.parse(event.data);

      // Check if the message is the payment event
      if ( message.status == 'paid' || message.status == 'confirmed' ) {
        self.data.status = message.status; // paid
        self.data.btcPaid = message.btcPaid; // amount paid
        self.elm.dispatchEvent(self.onpayment);
      }

    })

  }

  self.pubclient.request( 'getInvoiceBusToken', { invoiceId: this.data.id }, openBusAndSubscribe );

}

/**
 * Will generate a QR code for the invoice with the desired format
 *
 * @param {function} callback - Function with the first argument is the generated QR code element
 * @param {string(BIP21|BIP72A|BIP72B|BIP73)} format - The format of the url to be opened
 */
BitpayInvoice.prototype.getQrCode = function(callback, format){

  var self = this;

  if ( typeof callback !== "function" ) {
    throw new Error('First argument must be a function. The function should handle the qrcode elment as its first argument');
  }

  var getQrCode = function(){

    // Generate a QR Code
    var elm = document.createElement('div');
    elm.className = 'bp-qrcode';
    var qrcode = new QRCode( elm, self.data.paymentUrls[format] );

    callback( elm );
  }

  if ( self.data.id == undefined ) {
    // Create a BitPay invoice and then generate a QR Code
    self.elm.addEventListener('subscribe', getQrCode)
    self.loadInvoice();
  } else {
    // Generate a QR Code immediatly
    getQrCode();
  }

}
