const WebSocket = require("ws");
const fs = require("fs");
const pathM = require('path');
const crypto = require("crypto");


const path="D:\\Datos\\Documents\\Universidad\\202110\\Infrastructura de Comunicaciones\\Laboratorios\\Laboratorio 4\\ServidorInfracom\\SocketServer\\files";
const clients = [];
const files=[];
const queue=[];

const wsConnection = (server) =>
{
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => 
  {
    clients.push(ws);
    greet(ws);
    currentUsers();
    checkQueue();
    
    ws.on("close",()=>
    {
      const index2Remove = clients.indexOf(ws);
      clients.splice(index2Remove,1);
      currentUsers();
    });

    ws.on("message", (message) =>
    {
      const {name,users} = JSON.parse(message);      
      fs.exists((path+"\\"+name),(ans)=>
      {
          if(!ans) return ws.send(JSON.stringify({type:"error",content:`File ${name} doesn´t exist`}));
          queue.push({name:name,users:users});
          checkQueue();
      });
    });
  });
  const currentUsers=()=>{
    clients.forEach((client)=>
    {
      client.send(JSON.stringify({type:"count",content:clients.length}));
    });
  };
  const greet=(ws)=>
  {
    resp={type:"greet",content:files};
    ws.send(JSON.stringify(resp));
  }
  const checkQueue=()=>{
    let users=clients.length;
    let toRemove=[];
    queue.forEach((process)=>{
      if(process.users<=users)
      {
        toRemove.push(process);
        sendFile(process);
      }
    });
    toRemove.forEach((process)=>{
      queue.splice(queue.indexOf(process),1);
    });
  };
  const sendFile = (process) => 
  {   
    fs.readFile((path+"\\"+process.name),(err,data)=>
    {
        if(err)
        {
            console.log("Error");
            return;
        }
        const encodedData = new Buffer(data,"binary").toString('base64');
        const hash=crypto.createHash("sha512");
        const hashedData=hash.update(encodedData).digest('hex');
        clients.forEach((client) => 
        {   
            if(process.users==0) return;
            process.users-=1;
            client.send(JSON.stringify({type:"file",content:{name:process.name,data:encodedData,type:pathM.extname(path+"\\"+process.name),validation:hashedData}}));
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