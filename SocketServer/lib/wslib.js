const WebSocket = require("ws");
const fs = require("fs");
const pathM = require('path');
const crypto = require("crypto");

const path="D:\\Datos\\Documents\\Universidad\\202110\\Infrastructura de Comunicaciones\\Laboratorios\\Laboratorio 4\\ServidorInfracom\\SocketServer\\files";
const clients = [];
const files=[];
const hash=crypto.createHash("sha512");

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    greet(ws);
    
    ws.on("close",()=>{
        const index2Remove = clients.indexOf(ws);
        clients.splice(index2Remove,1);
    });

    ws.on("message", (message) => {
      const {name} = JSON.parse(message);
      
      fs.exists((path+"\\"+name),(ans)=>{
          (ans) ? sendFile(name):ws.send(JSON.stringify({type:"error",content:`File ${name} doesn´t exist`}));
      });
    });
  });

  const greet=(ws)=>{
      resp={type:"greet",content:files};
      ws.send(JSON.stringify(resp));
  }
  const sendFile = (name) => {   
    fs.readFile((path+"\\"+name),(err,data)=>{
        if(err)
        {
            console.log("Error");
            return;
        }
        const encodedData = new Buffer(data,"binary").toString('base64');
        const hashedData=hash.update(encodedData).digest('hex');
        clients.forEach((client) => {
            client.send(JSON.stringify({type:"file",content:{name:name,data:encodedData,type:pathM.extname(path+"\\"+name),validation:hashedData}}));
        });
    });
  };
};
function loadFileInfo()
{
    const names=fs.readdirSync(path);
    names.forEach((name)=>{
        const size = (fs.statSync(path+"\\"+name).size)/1000000;
        files.push({name:name,size:size});
    });
}
loadFileInfo();
exports.wsConnection = wsConnection;