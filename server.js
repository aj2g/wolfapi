//cluster is to maximize perfomance by utilizing all processors for heroku
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

//http server 
var http = require('http'); 
var url = require('url');

//Classes to import for wolfapi
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('U72E65-ARQERXR86Y');
    
//Sample problem
var userInput = "using induction, prove 9^n-1 is divisible by 4 assuming n>0";
  
    
//mathjax-node library
/*var mjAPI = require("mathjax-node");
mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  }
});*/

//Distribute process load
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
   cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else { 
  
    var server = http.createServer(function (req, res) {
    const { headers, method, url } = req;
    res.writeHead(200, {'Content-Type': 'text/html'});
    console.log(url);
    //var call = url.substr(1);

    API();
    function API(){
      if(userInput ==""){
        res.end('<html><body><h1>There was an error please refresh.</h1></body></html>');
      }
      else{
        waApi.getFull({
          input: userInput,  
          podstate: 'Step-by-step',
          appid: waApi,
          format: 'image',
          output: 'json',
          width: '500'
        }).then(console.log, console.error);   
      }
    }
}).listen(process.env.PORT || 5000);

server.timeout= 30000;
}