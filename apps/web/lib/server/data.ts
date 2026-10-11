// TODO-remove-last: single seam between the API routes and the data layer.
// Every route imports from here. Today it re-exports the JSON-backed mock in
// ./mock; swap these exports for real DB / service calls (Prisma, ECS RunTask,
// Redis logs, ...) and the routes keep working unchanged.
export * from "./mock/projects"
export * from "./mock/deployments"
export * from "./mock/env-vars"
export * from "./mock/domains"
export * from "./mock/logs"
export * from "./mock/users"
export { ensureRunner } from "./mock/builder"
