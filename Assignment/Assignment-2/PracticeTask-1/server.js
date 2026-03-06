const http = require("http");
const fs = require("fs");
const path = require("path");
const filepath = path.join(__dirname,"notes.json");

const server = http.createServer((req, res) => {

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  // GET /
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Welcome to Notes API");
  }

  // GET /notes
  else if (req.method === "GET" && pathname === "/notes") {

    const id = url.searchParams.get("id");

    fs.readFile(filepath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error reading notes");
      }

      const notes = JSON.parse(data);

      if (id) {
        const note = notes.find(n => n.id == id);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(note || {}));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(notes));
    });
  }

  // POST /notes
  else if (req.method === "POST" && pathname === "/notes") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {

      const newNote = JSON.parse(body);

      fs.readFile(filepath, "utf8", (err, data) => {

        let notes = [];

        if (!err && data) {
          notes = JSON.parse(data);
        }

        notes.push(newNote);

        fs.writeFile(filepath, JSON.stringify(notes, null, 2), () => {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Note added" }));
        });

      });
    });
  }

  // 404
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Route Not Found");
  }

});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
