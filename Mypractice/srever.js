const http = require("http");
const server = http.createServer((req, res)=>{
    const method = req.method;
    const url = req.url;
    console.log(method,url);
    if(method=='GET' && url=='/'){
        res.writeHead(200,{"Content-Type": "text/plain"});
        res.end("Welcome to Home Page");
    }

    else if(method === 'GET' && url === '/users'){
        const users = { users: ["Alice","Bob","Charlie"]};
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(users));
    }

    else if(method === "POST" && url === "/users"){
        let body = "";
        req.on("data", (chunk)=>{
            body+= chunk;
        });
        req.on("end", ()=> {
            const parseBody = JSON.parse(body);
            res.writeHead(201,{"Content-Type": "application/json"});
            res.end(JSON.stringify({
                message: "User created successfully",
                data: parsedBody,
            }));
        });
    }
    else{
        res.writeHead(404,{ "Content-Type": "text/plain"});
        res.end("Route not found");
    }
});


server.listen(3000,()=>{console.log("server listening")});