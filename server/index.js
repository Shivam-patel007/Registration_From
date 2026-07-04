import http from "node:http";
import { supabase } from "./db/connection.js";

const serverHandler = async (req, res) => {
  // 1. Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set common headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // 2. Route Handling
  try {
    if (method === "GET" && pathname === "/") {
      const { data, error } = await supabase.from("student").select("*");
      if (error)
        throw new Error(error.message || "Failed to connect supabase!");
      res.end(JSON.stringify({ data }));
    } else {
      // 404 for undefined routes
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Route not found" }));
    }
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};

const server = http.createServer(serverHandler);

server.listen(5000, () => {
  console.log("Server is listening at port 3000");
});
