'use strict';

const uutil = require('./uutil');
const fetch = require('./fetch');
const extract = require('./extract');
const { log } = require('./print');


function crawl(start, limit = 100) {
    let cache = {};
    let id = 0;  
    let carry = 0;
    let count = 0;
    let pages = [];
    let links = [];
    log('Start crawl "' + start + '" with limit ' + limit);
    
    return new Promise((resolve, reject) => {
        !function curl(src, dst) {
            let dstNorm = uutil.normalize(dst);
            // create a new page if is not presented yet
            if (dstNorm in cache === false) {
                if (count + 1 > limit) {
                    return;
                }
                cache[dstNorm] = ++id;
                // init the page object
                let page = { id, url: dstNorm };
                count++;
                carry++;
                
                log('Request (#' + page.id + ') "' + dstNorm + '"');
                fetch(dstNorm)
                    .then(fetched => {
                        log('Fetched (#' + page.id + ') "' + dstNorm + '" with code ' + fetched.code);
                        page.code = fetched.code;
                        extract(fetched, dstNorm, start).forEach(ln => curl(dstNorm, ln));
                    })
                    .catch(err => {
                        log('Fetched (#' + page.id + ') "' + dstNorm + '" with error ' + err.message);
                        page.code = null;
                    })
                    .finally(() => {
                        pages.push(page);
                        // resolve the result on the last response
                        if (--carry === 0) {
                            log('Finish crawl "' + start + '" on count ' + count);
                            resolve({ 
                                pages: pages.sort((p1, p2) => p1.id - p2.id), 
                                links: links.sort((l1, l2) => l1.from - l2.from || l1.to - l2.to), 
                                count, 
                                fin: count < limit 
                            });
                        }
                    });
            }
            // save the link if is not root
            if (src !== null) {
                let srcNorm = uutil.normalize(src);
                links.push({ from: cache[srcNorm], to: cache[dstNorm], link: dst });
            }
        }(null, start);
    });
}

module.exports = crawl;