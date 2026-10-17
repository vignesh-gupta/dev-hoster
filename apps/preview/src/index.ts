  import express from "express";
  import httpProxy from "http-proxy";

  const PORT = process.env.PORT || 8000;
  const app = express();
  const proxy = httpProxy.createProxy();
  const s3BaseUrl = process.env.S3_BASE_URL

  app.use(async (req, res) => {
    try {
      const subdomain = req.hostname.split(".")[0];

      if(!subdomain) {
        throw new Error("Missing subdomain in request hostname");
      }

      if(!s3BaseUrl) {
        throw new Error("S3_BASE_URL environment variable is not set");
      }
      
      const response = await fetch("http://localhost:3000/api/rs/get-live?slug=" + subdomain)
      if (!response.ok) {
        throw new Error(`Base URL API returned ${response.status}`);
      }

      const project = await response.json()

      const {id: projectId} = project;

      if (!projectId) {
        throw new Error("The /rs/get-live response must contain a projectId field");
      }
      const target = `${s3BaseUrl}${projectId}`;
      return proxy.web(req, res, { target, changeOrigin: true });
    } catch (error) {
      console.error("Failed to resolve base URL:", error);
      return res.status(502).send("Unable to resolve the base URL");
    }
  });

  proxy.on("proxyReq", (proxyReq, req) => {
    if (req.url === "/") proxyReq.path += "index.html";
  });

  app.listen(PORT, () => console.log(`Reverse Proxy Server is running on port ${PORT}`));