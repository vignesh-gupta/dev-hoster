To Test if the RDS service is running on localhost, you can use the following PowerShell command:

```sh
Test-NetConnection localhost -Port 7001
```

To Run a pg-forwarder container to forward the RDS port to localhost, you can use the following command:

```sh
docker run -d --name pg-forward -p 7001:5432 alpine/socat tcp-listen:5432,fork,reuseaddr tcp:floci-rds-db-8D8EB9F3C70E47E5959AC1DF-87a54d:5432
```
