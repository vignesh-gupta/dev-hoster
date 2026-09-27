import express from "express";
import httpProxy from "http-proxy";

const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.S3_BASE_URL;

if(!BASE_URL) {
  console.error("S3_BASE_URL is not defined in the environment variables.");
  process.exit(1);
}

const app = express();

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];
  const resolvesTo = `${BASE_URL}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
  return proxyReq;
});

app.listen(PORT, () => console.log(`Reverse Proxy Server is running on port ${PORT}`));