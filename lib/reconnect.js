var amqp = require('amqplib/callback_api');

var amqpConn = null;

function start() {

    amqp.connect(process.env.RABBIT_URL + "?heartbeat=60", function (err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 3000);
        }

        conn.on("error", function (err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
                return setTimeout(start, 3000);
            }
        });

        conn.on("close", function () {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 3000);
        });

        console.log("[AMQP] connected");
        amqpConn = conn;

        whenConnected();
    });
}

function whenConnected() {
    startPublisher();

    if (process.env.CONSUME === 'true') {
        startWorker();
    }
}

var pubChannel = null;
var offlinePubQueue = [];
var offlineDepth = 0;

function startPublisher() {

    amqpConn.createConfirmChannel(function (err, ch) {
        if (closeOnErr(err)) return;

        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;

        // TODO: Maybe change name to "processOfflineMessages"?
        function publishOneOfflineMessage() {

            if (offlineDepth > 10) {
                console.log('Too many offline messages. Throttling back...');
                return;
            }

            if (pubChannel && offlinePubQueue && offlinePubQueue.length > 0) {
                var m = offlinePubQueue.shift();

                if (m) {
                    publish(m[0], m[1], m[2]);
                    offlineDepth++;
                    publishOneOfflineMessage();
                }
            }

        }

        setInterval(function () {

            if (offlinePubQueue && offlinePubQueue.length > 0) {
                console.log(offlinePubQueue.length + ' messages in offline queue');
            }

            offlineDepth = 0;
            publishOneOfflineMessage();
        }, 5000);

    });
}

// Method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {

    if (pubChannel) {
        try {
            pubChannel.publish(exchange, routingKey, content, { persistent: true },
                function (err, ok) {
                    if (err) {
                        console.error("[AMQP] publish", err);
                        offlinePubQueue.push([exchange, routingKey, content]);

                        if (pubChannel && pubChannel.connection) {
                            pubChannel.connection.close();
                        }
                        pubChannel = null;
                    }
                });
        } catch (e) {
            console.error("[AMQP] publish", e.message);
            offlinePubQueue.push([exchange, routingKey, content]);

            if (pubChannel && pubChannel.connection) {
                pubChannel.connection.close();
            }

            pubChannel = null;
        }
    } else {
        offlinePubQueue.push([exchange, routingKey, content]);
    }

}

// A worker that acks messages only if processed successfully
function startWorker() {

    amqpConn.createChannel(function (err, ch) {
        if (closeOnErr(err)) return;

        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        ch.prefetch(10);

        ch.assertQueue("jobs", { durable: true }, function (err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume("jobs", processMsg, { noAck: false });
            console.log("Worker is started");
        });

        function processMsg(msg) {
            work(msg, function (ok) {
                try {
                    if (ok)
                        ch.ack(msg);
                    else
                        ch.reject(msg, true);
                } catch (e) {
                    closeOnErr(e);
                }
            });
        }
    });
}

function work(msg, cb) {
    console.log("Got msg", msg.content.toString());
    cb(true);
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

if (process.env.PUBLISH === 'true') {
    setInterval(function () {
        publish("", "jobs", new Buffer(Date.now().toString()));
    }, 1000);
}

start();
