/* Magic Mirror
 * Module: stocks
 *
 * By Alex Yakhnin https://github.com/alexyak
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('stocks helper started ...');
    },

    getStocks: function (url) {
        var self = this;
        console.log('requesting:' + url);
        request({ url: url, method: 'GET' }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                self.sendSocketNotification('STOCKS_RESULT', result);
            }
        });

    },

    getStocksMulti: function (queryData) {
        var self = this;
        var url = `${queryData.url}/stable/stock/market/batch?symbols=${queryData.stocks}&types=quote&token=${queryData.token}`
        console.log('url:' + url.substring(0, url.indexOf('token=')));
        request({ url: url, method: 'GET' }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const stock = [];
                const data = JSON.parse(body);
                Object.keys(data).forEach(k => {
                    stock.push(data[k].quote);
                });
                self.sendSocketNotification('STOCKS_RESULT_MULTI', stock);
            }
            else {
                console.log('Stocks fetch error', error, response.statusCode, response.body)
            }
        });
    },


    getStocksMultiUrl: function (urls) {
        var self = this;

        var count = urls.length;
        var counter = 0;
        var stockResults = [];

        urls.forEach(url => {
            console.log('url:' + url);
            request({ url: url, method: 'GET' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    stockResults.push(JSON.parse(body));
                    counter++;
                    if (counter == count - 1) {
                        self.sendSocketNotification('STOCKS_RESULT', stockResults);
                    }
                }
                else {
                    var err = error;
                }
            });
        });
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_STOCKS') {
            this.getStocks(payload);
        }
        if (notification === "GET_STOCKS_MULTI") {
        this.getStocksMulti(payload);
        }
    }

});

