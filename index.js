// "message" is a predefined event in Node.js's dgram module. that's why we said server.on('message')
// This event is triggered whenever the UDP server receives a new message from a client.


// Key properties of rinfo:
// rinfo.address: The IP address of the client.
// rinfo.port: The port number the client used to send the message.
// rinfo.size: The size of the message in bytes.

// Step 1: Import the dgram module

const dgram = require('dgram');

// Step 2: Create a UDP server // 'udp4' means IPv4
const server = dgram.createSocket('udp4');
const dnspacket = require("dns-packet")
// Step 3: Handle incoming messages

const db = {
    'piyushgarg.dev': {
        type: 'A',
        data: '1.2.3.4'
    },
    'aparna.dev': {
        type: 'CNAME',
        data: 'piyushgarg.dev'
    }
}
server.on('message', (msg, rinfo) => {
    const inmsg = dnspacket.decode(msg) // Decode the incoming DNS message.
    const client = db[inmsg.questions[0].name] // Look up the query name in the `db`.
    if (client) {
        console.log(inmsg)
        console.log(client.name)
        console.log(rinfo) // Log the remote client information (address, port, etc.).

        const ans = dnspacket.encode({
            type: 'response',
            id: inmsg.id,
            flags: dnspacket.AUTHORITATIVE_ANSWER, // Indicate the server is authoritative.
            questions: inmsg.questions, // Echo the original question.
            answers: [{
                type: client.type,
                class: 'IN',
                name: inmsg.questions[0].name, // The domain name being queried.
                data: client.data // The data for the DNS record
            }]

        })

        server.send(ans, rinfo.port, rinfo.address)
    }


});

// Step 4: Bind the server to a specific port
server.bind(63, () => {
    console.log('UDP Server is listening on port 63');
});