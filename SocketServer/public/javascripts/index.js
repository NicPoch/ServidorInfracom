const ws = new WebSocket("ws://localhost:3000"); //cambiar cuando manejemos una dirección real 
const showTable = document.getElementById("files");
const counter = document.getElementById("count");


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
    console.log(data);    
    sha512(data.data).then((hash)=>
    {
        if(data.validation===hash)
        {
            let decodedData = atob(data.data);
            const blob = new Blob([decodedData],{type:data.type});
            downloadBlob(blob, data.name);
        }
        else
        {
            alert("Bad hash, see console");
            console.log(hash);
            console.log(data.validation);
        }
    });
};
/**
 * Sacado de stackoverflow: https://stackoverflow.com/questions/55926281/how-do-i-hash-a-string-using-javascript-with-sha512-algorithm
 * autor: Filip Dimitrovski
 */
const sha512=(str)=>
{
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
}
/**
 * Sacado de https://dev.to/nombrekeff/download-file-from-blob-21ho
 * Autor Manolo Edge    
 */
function downloadBlob(blob, name = 'file.txt')
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