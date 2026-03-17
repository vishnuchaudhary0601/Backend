const http = require("http");
const fs = require("fs");
const url = require("url");

const FILE = "./students.json";

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  const id = parsedUrl.query.id ? parseInt(parsedUrl.query.id) : null;

  console.log(method, pathname);

  if (pathname === "/students") {

    // ================= GET =================
    if (method === "GET") {
      fs.readFile(FILE, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500);
          return res.end("Server Error");
        }

        const students = data ? JSON.parse(data) : [];

        if (id) {
          const student = students.find(s => s.id === id);
          if (!student) {
            res.writeHead(404);
            return res.end("Student not found");
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(student));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(students));
      });
    }

    // ================= POST =================
    else if (method === "POST") {
      let body = "";

      req.on("data", chunk => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const newStudent = JSON.parse(body);

          if (!newStudent.name || !newStudent.age || !newStudent.course) {
            res.writeHead(400);
            return res.end("Missing required fields");
          }

          fs.readFile(FILE, "utf8", (err, data) => {
            if (err) {
              res.writeHead(500);
              return res.end("Server Error");
            }

            const students = data ? JSON.parse(data) : [];

            const newId = students.length > 0
              ? students[students.length - 1].id + 1
              : 1;

            const studentObj = {
              id: newId,
              name: newStudent.name,
              age: newStudent.age,
              course: newStudent.course
            };

            students.push(studentObj);

            fs.writeFile(FILE, JSON.stringify(students, null, 2), err => {
              if (err) {
                res.writeHead(500);
                return res.end("Server Error");
              }

              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify(studentObj));
            });
          });

        } catch {
          res.writeHead(400);
          res.end("Invalid JSON");
        }
      });
    }

    // ================= PUT =================
    else if (method === "PUT") {
      if (!id) {
        res.writeHead(400);
        return res.end("ID required");
      }

      let body = "";

      req.on("data", chunk => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const updatedData = JSON.parse(body);

          fs.readFile(FILE, "utf8", (err, data) => {
            if (err) {
              res.writeHead(500);
              return res.end("Server Error");
            }

            const students = data ? JSON.parse(data) : [];
            const index = students.findIndex(s => s.id === id);

            if (index === -1) {
              res.writeHead(404);
              return res.end("Student not found");
            }

            students[index] = {
              ...students[index],
              ...updatedData
            };

            fs.writeFile(FILE, JSON.stringify(students, null, 2), err => {
              if (err) {
                res.writeHead(500);
                return res.end("Server Error");
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(students[index]));
            });
          });

        } catch {
          res.writeHead(400);
          res.end("Invalid JSON");
        }
      });
    }

    // ================= DELETE =================
    else if (method === "DELETE") {
      if (!id) {
        res.writeHead(400);
        return res.end("ID required");
      }

      fs.readFile(FILE, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500);
          return res.end("Server Error");
        }

        const students = data ? JSON.parse(data) : [];
        const filtered = students.filter(s => s.id !== id);

        if (students.length === filtered.length) {
          res.writeHead(404);
          return res.end("Student not found");
        }

        fs.writeFile(FILE, JSON.stringify(filtered, null, 2), err => {
          if (err) {
            res.writeHead(500);
            return res.end("Server Error");
          }

          res.writeHead(200);
          res.end("Student deleted successfully");
        });
      });
    }

    else {
      res.writeHead(405);
      res.end("Method Not Allowed");
    }

  } else {
    res.writeHead(404);
    res.end("Route Not Found");
  }

});

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});