To Test if the RDS service is running on localhost, you can use the following PowerShell command:
```sh
Test-NetConnection localhost -Port 7001
```

To Run a pg-forwarder container to forward the RDS port to localhost, you can use the following command:
```sh
 docker run -d --name pg-forward -p 7001:5432 alpine/socat tcp-listen:5432,fork,reuseaddr tcp:172.17.0.2:5432
```