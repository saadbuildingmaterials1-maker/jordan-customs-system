const http = require('http');
const { performance } = require('perf_hooks');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
};

let successCount = 0;
let errorCount = 0;
let totalTime = 0;
let minTime = Infinity;
let maxTime = 0;

const startTime = performance.now();

function makeRequest(callback) {
  const reqStart = performance.now();
  
  const req = http.request(options, (res) => {
    const reqEnd = performance.now();
    const duration = reqEnd - reqStart;
    
    totalTime += duration;
    minTime = Math.min(minTime, duration);
    maxTime = Math.max(maxTime, duration);
    
    if (res.statusCode === 200) {
      successCount++;
    } else {
      errorCount++;
    }
    
    res.on('data', () => {});
    res.on('end', callback);
  });

  req.on('error', () => {
    errorCount++;
    callback();
  });

  req.end();
}

const concurrentRequests = 100;
const totalRequests = 1000;
let completed = 0;
let inProgress = 0;

function sendBatch() {
  while (inProgress < concurrentRequests && completed < totalRequests) {
    inProgress++;
    makeRequest(() => {
      inProgress--;
      completed++;
      
      if (completed % 100 === 0) {
        console.log(`✓ ${completed}/${totalRequests} requests completed`);
      }
      
      if (completed === totalRequests) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log('\n=== Load Test Results ===');
        console.log(`Total Requests: ${totalRequests}`);
        console.log(`Successful: ${successCount}`);
        console.log(`Failed: ${errorCount}`);
        console.log(`Success Rate: ${((successCount/totalRequests)*100).toFixed(2)}%`);
        console.log(`Average Response Time: ${(totalTime/totalRequests).toFixed(2)}ms`);
        console.log(`Min Response Time: ${minTime.toFixed(2)}ms`);
        console.log(`Max Response Time: ${maxTime.toFixed(2)}ms`);
        console.log(`Total Duration: ${duration.toFixed(2)}ms`);
        console.log(`Requests/sec: ${(totalRequests/(duration/1000)).toFixed(2)}`);
        
        process.exit(0);
      } else {
        sendBatch();
      }
    });
  }
}

console.log('Starting load test...');
console.log(`Concurrent requests: ${concurrentRequests}`);
console.log(`Total requests: ${totalRequests}\n`);

sendBatch();
