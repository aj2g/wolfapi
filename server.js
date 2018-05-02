//cluster is to maximize perfomance by utilizing all processors for heroku
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;


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

//WolfAPI function call
   
 
//Server run instance
    var server = http.createServer(function (req, res) {
    const { headers, method, url } = req;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<script type="text/javascript" src="ASCIIMathML.js"></script>'); //include mathml
    console.log(url);
    //var call = url.substr(1);

    API();
//Define API
function API(){
      if(userInput ==""){
        res.end('<html><body><h1>There was an error please refresh.</h1></body></html>');
      }
      else{
        waApi.getFull({
          input: userInput,
          includepodid: 'Result',
          podstate: 'Step-by-step',
          //appid: waApi,
          //format: 'plaintext',  // change back to image
          //output: 'json',
        }).then((queryresult) => {
            res.end('<script type="text/javascript" src="ASCIIMathML.js"></script>' + queryresult.pods[0].subpods[2].plaintext)
        }).catch(console.error)
    }
  }
}).listen(process.env.PORT || 5000);




/*then((queryresult) => {
          const pods = queryresult.pods;
          const output = pods.map((pod) => {
          const subpodContent = pod.subpods.map(subpod =>
          `  <img src="${subpod.img.src}" alt="${subpod.img.alt}">`
        ).join('\n');
          return `<h2>${pod.title}</h2>\n${subpodContent}`;
        }).join('\n');
          res.end(output);
        }).catch(console.error);
*/
/*
//Distribut cluster load
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
  
  server.timeout= 30000;
}*/