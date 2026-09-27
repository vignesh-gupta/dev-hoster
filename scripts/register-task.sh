aws ecs register-task-definition \
  --endpoint-url http://localhost:4566 \
  --family builder-server-task \
  --network-mode bridge \
  --container-definitions '[{
    "name": "builder-server",
    "image": "localhost:5100/builder-server:latest",
    "memory": 3072,
    "cpu": 1024,
    "environment": [
      {"name": "AWS_ACCESS_KEY_ID", "value": "'"$AWS_ACCESS_KEY_ID"'"},
      {"name": "AWS_SECRET_ACCESS_KEY", "value": "'"$AWS_SECRET_ACCESS_KEY"'"},
      {"name": "AWS_REGION", "value": "us-east-1"},
      {"name": "GIT_PAT_TOKEN", "value": "'"$GIT_PAT_TOKEN"'"}
    ]
  }]'
