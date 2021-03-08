const ws = new WebSocket("ws://localhost:3000");
const showTable = document.getElementById("files");


ws.onopen=()=>{
    alert("Connection Made!");
};

ws.onerror=(err)=>{
    alert("Error, look on console for details");
    console.log(err);
};

ws.onmessage = (msg) => {
  const resp =JSON.parse(msg.data);
  if(resp.type==="greet")
  {
    showGreet(resp.content);
  }
  else(resp.type==="file")
  {
    download(resp.content);
  }
};

const showGreet=(data)=>{
    data.forEach((item)=>{
        const row = document.createElement("tr");
        const tdName= document.createElement("td");
        const tdNametTxt= document.createTextNode(item.name);
        tdName.appendChild(tdNametTxt);
        tdName.className="fileName";
        tdName.onclick=()=>{askForFile(item.name)};
        const tdSize= document.createElement("td");
        const tdSizeTxt= document.createTextNode(item.size);
        tdSize.appendChild(tdSizeTxt);
        row.appendChild(tdName);
        row.appendChild(tdSize);
        showTable.appendChild(row);
    });
};

const askForFile=(file)=>{
    const req ={
        name:file
    };
    ws.send(JSON.stringify(req));
}

const download =(data)=>{
    console.log(data);    
};