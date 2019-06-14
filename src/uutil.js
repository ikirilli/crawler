'use strict';

const url = require('url');

function getLowerHost(dst) {
    return (new URL(dst)).hostname.toLowerCase();
}

function inScope(dst, base) {
    let dstHost = getLowerHost(dst);
    let baseHost = getLowerHost(base);
    let i = dstHost.indexOf(baseHost);
    return i === 0 || dstHost[i - 1] === '.'; 
}

function normalize(dst) {
    let dstUrl = new URL(dst);
    let origin = dstUrl.protocol + '//' + dstUrl.hostname;
    if (dstUrl.port && (!/^https?\:/i.test(dstUrl.protocol) || ![80, 8080, 443].includes(+dstUrl.port))) {
        origin += ':' + dstUrl.port;
    }
    let path = dstUrl.pathname + dstUrl.search;
    
  
    return origin.toLowerCase() 
        + path.replace(/%([0-9a-f]{2})/ig, (_, es) => '%' + es.toUpperCase());
}

module.exports = { inScope, normalize };