const ws = new WebSocket("ws://localhost:3000"); //cambiar cuando manejemos una dirección real 
const showTable = document.getElementById("files");
const counter = document.getElementById("count");
const currentStateTable=document.getElementById("toZip");
const downloadBtn=document.getElementById("download");

downloadBtn.addEventListener("click",()=>genZip());

const state=[];

const showState=()=>{
  currentStateTable.innerHTML="";
  state.forEach((s)=>{
    let tr=document.createElement("tr");
    let tdType=document.createElement("td");
    let typeTxt;
    if(s.type=="file")
    {
      typeTxt=document.createTextNode("File");
    }
    else
    {
      typeTxt=document.createTextNode("Log");
    }
    tdType.appendChild(typeTxt);
    tr.appendChild(tdType);
    let tdName=document.createElement("td");
    let nameTxt;
    if(s.type=="file")
    {
      nameTxt=document.createTextNode(s.content.name);
    }
    else
    {
      nameTxt=document.createTextNode(s.name);
    }
    tdName.appendChild(nameTxt);
    tr.appendChild(tdName);
    let tdWhen=document.createElement("td");
    let whenTxt=document.createTextNode(s.when.toString());
    tdWhen.appendChild(whenTxt);
    tr.appendChild(tdWhen);
    currentStateTable.appendChild(tr);
  });
};

function genZip()
{
  var zip = new JSZip();
  var logs=zip.folder("Logs");
  var archivosRecibidos=zip.folder("ArchivosRecibidos");
  state.forEach((f)=>{
    if(f.type==="file")
    {
      archivosRecibidos.file(f.content.name,f.content.info);
    }
    else
    {
      logs.file(f.name,JSON.stringify(f.content));
    }
  });
  state.splice(0,state.length);
  showState();
  zip.generateAsync({type:"blob"}).then(function(content) {
      downloadBlob(content,"ArchivoUsuario.zip");
  });
};


ws.onopen=()=>
{
    alert("Connection Made!");
};

ws.onerror=(err)=>
{
    alert("Error, look on console for details");
    console.log(err);
};

ws.onmessage = (msg) =>
{
  const resp =JSON.parse(msg.data);
  if(resp.type==="greet")
  {
    showGreet(resp.content);
  }
  else if(resp.type==="file")
  {
    download(resp.content);
  }
  else if(resp.type==="count")
  {
    setCount(resp.content);
  }
  else if(resp.type ==="error")
  {
    console.log(msg);
  }
};

const setCount=(count)=>
{
    counter.textContent=count;
};

const showGreet=(data)=>
{
    data.forEach((item)=>
    {
        const row = document.createElement("tr");
        const tdName= document.createElement("td");
        const tdNametTxt= document.createTextNode(item.name);
        tdName.appendChild(tdNametTxt);
        tdName.className="fileName";
        tdName.onclick=()=>{askForFile(item.name)};
        const tdSize= document.createElement("td");
        const tdSizeTxt= document.createTextNode(item.size+"MB");
        tdSize.appendChild(tdSizeTxt);
        row.appendChild(tdName);
        row.appendChild(tdSize);
        showTable.appendChild(row);
    });
};

const askForFile=(file)=>
{
    let users=Number(prompt("Number of clients to send: ",1));
    const req ={
        name:file,
        users:users
    };
    ws.send(JSON.stringify(req));
}

const download =(data)=>
{
    let dateLog=new Date();
    let log={
      name:`${dateLog.getFullYear()}-${dateLog.getMonth()}-${dateLog.getDay()}-${dateLog.getMinutes()}-${dateLog.getSeconds()}-log.txt`,
      succes:false,
      failure:false,
      file:data.name,
      time:0
    };
    let timeInit=Date.now();
    console.log(data);    
    const hash=hashCode(data.data);
    if(data.validation===hash)
    {
      let decodedData = atob(data.data);
      const blob = new Blob([decodedData],{type:data.type});
      let toState={info:blob,name:data.name};
      state.push({type:"file",content:toState,when:new Date()});
      log.succes=true;
      //downloadBlob(blob, data.name);
    }
    else
    {
      alert("Bad hash, see console");
      console.log(hash);
      console.log(data.validation);
      log.failure=true;
    }
    let endTime=Date.now();
    log.time=endTime-timeInit;
    state.push({type:"log",content:log,when:dateLog,name:`${dateLog.getFullYear()}-${dateLog.getMonth()}-${dateLog.getDay()}-${dateLog.getMinutes()}-${dateLog.getSeconds()}-log.txt`});
    showState();
};

/**
 * Sacado de https://dev.to/nombrekeff/download-file-from-blob-21ho
 * Autor Manolo Edge    
 */
function downloadBlob(blob, name)
{
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);
  
    // Create a link element
    const link = document.createElement("a");
  
    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;
    // Append link to the body
    document.body.appendChild(link);
  
    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );
  
    // Remove link from body
    document.body.removeChild(link);
}

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