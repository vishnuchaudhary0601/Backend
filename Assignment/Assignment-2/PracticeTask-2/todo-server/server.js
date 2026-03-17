const http = require("http");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "todos.json");

const server = http.createServer((req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;
    const id = url.searchParams.get("id");

    // READ TODOS SAFELY
    const readTodos = () => {
        try {
            const data = fs.readFileSync(filePath, "utf8");
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    };

    // WRITE TODOS
    const writeTodos = (data) => {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    };

    // GET ALL TODOS
    if (method === "GET" && pathname === "/todos" && !id) {
        const todos = readTodos();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(todos));
    }

    // GET SINGLE TODO
    if (method === "GET" && pathname === "/todos" && id) {

        const todos = readTodos();
        const todo = todos.find(t => t.id == id);

        if (!todo) {
            res.writeHead(404);
            return res.end("Todo not found");
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(todo));
    }

    // CREATE TODO
    if (method === "POST" && pathname === "/todos") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            if (!body || body.trim() === "") {
                res.writeHead(400);
                return res.end("Request body is empty");
            }

            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.writeHead(400);
                return res.end("Invalid JSON");
            }

            if (!data.title) {
                res.writeHead(400);
                return res.end("Title is required");
            }

            const todos = readTodos();

            const newTodo = {
                id: Date.now(),
                title: data.title,
                completed: false
            };

            todos.push(newTodo);

            writeTodos(todos);

            res.writeHead(201, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(newTodo));
        });

        return;
    }

    // UPDATE TODO (MARK COMPLETED)
    if (method === "PUT" && pathname === "/todos" && id) {

        const todos = readTodos();
        const todo = todos.find(t => t.id == id);

        if (!todo) {
            res.writeHead(404);
            return res.end("Todo not found");
        }

        todo.completed = true;

        writeTodos(todos);

        res.writeHead(200);
        return res.end("Todo updated");
    }

    // DELETE TODO
    if (method === "DELETE" && pathname === "/todos" && id) {

        const todos = readTodos();
        const newTodos = todos.filter(t => t.id != id);

        if (todos.length === newTodos.length) {
            res.writeHead(404);
            return res.end("Todo not found");
        }

        writeTodos(newTodos);

        res.writeHead(200);
        return res.end("Todo deleted");
    }

    // ROUTE NOT FOUND
    res.writeHead(404);
    res.end("Route not found");

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});