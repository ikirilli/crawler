'use strict';

const url = require('url');

const clients = Object.freeze({
    'http:': require('http'),
    'https:': require('https')
});

const ft = require('./enum/ft');


function fetch(dst) {
    return new Promise((resolve, reject) => {
        let dstURL = new URL(dst);
        let client = clients[dstURL.protocol];
        if (!client) {
            throw new Error('Could not select a client for ' + dstURL.protocol);
        }
        // send the request and resolve the result
        let req = client.get(dstURL.href, res => {
            let code = res.statusCode;
            let codeGroup = Math.floor(code / 100);
            // OK
            if (codeGroup === 2) {
                let body = [];
                res.setEncoding('utf8');
                res.on('data', chunk => body.push(chunk));
                res.on('end', () => resolve({ code, content: body.join(''), type: ft.OK }));
            }
            // REDIRECT
            else if (codeGroup === 3 && res.headers.location) {
                resolve({ code, location: res.headers.location, type: ft.REDIRECT });
            }
            // NO_DATA (others)
            else {
                resolve({ code, type: ft.NO_DATA });
            }
        });
        req.on('error', err => reject('Failed on the request: ' + err.message));
        req.end();
    });
}

module.exports = fetch;