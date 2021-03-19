const WebSocket = require("ws");
const fs = require("fs");
const pathM = require('path');
const { timeEnd } = require("console");
const { json } = require("express");

const path = pathM.resolve("../SocketServer/files");
const logs=pathM.resolve("../SocketServer/Logs");
const clients = [];
const files=[];
const queue=[];

const wsConnection = (server) =>
{
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws,req) => 
  {
    clients.push({socket:ws,IP:req.socket.remoteAddress});
    greet(ws);
    currentUsers();
    checkQueue();
    
    ws.on("close",()=>
    {
      let client2Remove = clients.filter(c=>c.socket!==ws)[0];
      clients.splice(clients.indexOf(client2Remove),1);
      currentUsers();
    });

    ws.on("message", (message) =>
    {
      const {name,users} = JSON.parse(message);      
      fs.exists((path+"/"+name),(ans)=>
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
      client.socket.send(JSON.stringify({type:"count",content:clients.length}));
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
  function hashCode(info)
  {
    var hash=0;
    for(var i =0;i<info.length;i++)
    {
      var character = info.charCodeAt(i);
      hash = ((hash<<5)-hash)+character;
      hash = hash & hash;
    }
    return hash;
  }
  const logger=(newLog)=>{
    const dateLog=new Date();
    const fileName=`${logs}\\${dateLog.getFullYear()}-${dateLog.getMonth()}-${dateLog.getDay()}-${dateLog.getMinutes()}-${dateLog.getSeconds()}-log.txt`;
    fs.writeFile(fileName,JSON.stringify(newLog),(err)=>{
      (err) ? console.log(err) : console.log(`New Log: ${fileName}`);
    });
  };
  const sendFile = (process) => 
  {   
    fs.readFile((path+"/"+process.name),(err,data)=>
    {
        if(err)
        {
            console.log("Error");
            return;
        }
        const encodedData = new Buffer(data,"binary").toString('base64');
        const hashedData =hashCode(encodedData);
        const toLog=[];
        clients.forEach((client) => 
        {   
            if(process.users==0) return;
            const clientInfo={}
            clientInfo.IP=client.IP;
            clientInfo.recibio=false;
            clientInfo.perdio=false;
            process.users-=1;
            const initSend=Date.now();
            try
            {
              client.socket.send(JSON.stringify({type:"file",content:{name:process.name,data:encodedData,type:pathM.extname(path+"/"+process.name),validation:hashedData}}));  
              clientInfo.recibio=true;
            }
            catch (error) 
            {
              clientInfo.perdio=true;
            }
            const endSend=Date.now();
            clientInfo.diftime=endSend-initSend;
            toLog.push(clientInfo);
        });
        logger(toLog);
    });
  };
};
function loadFileInfo()
{
    const names=fs.readdirSync(path);
    names.forEach((name)=>{
        const size = (fs.statSync(path+"/"+name).size)/1000000;
        files.push({name:name,size:size});
    });
}

loadFileInfo();
exports.wsConnection = wsConnection;