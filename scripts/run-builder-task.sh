aws ecs run-task \
  --endpoint-url http://localhost:4566 \
  --cluster default \
  --task-definition builder-server-task \
  --count 1 \
  --overrides '{
    "containerOverrides": [
        {
          "name": "builder-server",
          "environment": [
            {"name": "GIT_REPOSITORY__URL", "value": "https://github.com/vignesh-gupta/dhurva-portfolio-2"},
            {"name": "PROJECT_ID", "value": "p1"}
          ]
        }
      ]
    }'