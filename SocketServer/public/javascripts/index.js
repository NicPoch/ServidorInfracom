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
    sha512(data.data).then((hash)=>{
        if(data.validation===hash)
        {
            console.log("Good hash");
        }
        else
        {
            console.log("Bad hash");
            console.log(hash);
            console.log(data.validation);
        }
    });
};
/**
 * Sacado de stackoverflow: https://stackoverflow.com/questions/55926281/how-do-i-hash-a-string-using-javascript-with-sha512-algorithm
 * autor: Filip Dimitrovski
 */
const sha512=(str)=>{
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
}