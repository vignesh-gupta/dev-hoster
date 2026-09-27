#!/bin/bash

eval $(floci env)

aws ecr get-login-password --endpoint-url http://localhost:4566   | docker login --username AWS --password-stdin localhost:5100

docker build -t builder-server:latest .

docker tag builder-server:latest localhost:5100/builder-server:latest

docker push localhost:5100/builder-server:latest