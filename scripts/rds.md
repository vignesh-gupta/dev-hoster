# Steps to run RDS locally

1. Create a new RDS instance using floci UI

2. Verify the RDS instance is running by
```sh
aws rds describe-db-instances --endpoint-url http://localhost:4566 --query "DBInstances[].{id:DBInstanceIdentifier,status:DBInstanceStatus,engine:Engine,port:Endpoint.Port}" --output table
```

3. Get the RDS container name from docker ps with word rds in it:
```sh
docker ps --filter name=floci-rds-db --format "{{.Names}}"
```

4. Check it's IP:
```sh
docker ps --filter name=floci-rds-db --format "{{.Names}}"
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" <that-container-name-from-step-3>
```


5. Publish it to your machine
```sh
docker rm -f pg-forward
docker run -d --name pg-forward -p 7001:5432 alpine/socat tcp-listen:5432,fork,reuseaddr tcp:<IP-from-step-2>:5432
```

6. Test a real login
```
docker run --rm -it postgres:18.6-alpine psql "postgresql://root:<password>@host.docker.internal:7001/postgres?sslmode=disable" -c "\l"
```


----------- 


To Test if the RDS service is running on localhost, you can use the following PowerShell command:

```powershell
Test-NetConnection localhost -Port 7001
```
