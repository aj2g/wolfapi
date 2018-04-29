var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
  const { headers, method, url } = req;
  res.writeHead(200, {'Content-Type': 'text/html'});
  console.log(url);
  var call = url.substr(1);
  
  
  const WolframAlphaAPI = require('wolfram-alpha-api');
  const waApi = WolframAlphaAPI('U72E65-ARQERXR86Y');

  API();
  function API(){
    if(call ===""){
      res.end('<html><body><h1>There was an error please refresh.</h1></body></html>');
    }
    else{
      waApi.getFull(call).then((queryresult) => {
        //input: 'prove by induction '+ call,  
        podstate: 'Solution__Step-by-step solution',
        format: 'mathml',
      }).then((queryresult) => {
        console.log(queryresult.pods[0].subpods[0].plaintext)
      }).catch(console.error);
    }
  }
}).listen(process.env.PORT || 5000);
