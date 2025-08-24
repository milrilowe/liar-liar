module.exports = {
    apps: [
        { name: "api", cwd: "./apps/server", script: "pnpm", args: "dev", env: { NODE_ENV: "production", PORT: "3001", HOST: "0.0.0.0" } },
        { name: "admin-panel", cwd: "./apps/admin-panel", script: "pnpm", args: "dev -- --port 5173 --host", env: { NODE_ENV: "production" } },
        { name: "display", cwd: "./apps/display", script: "pnpm", args: "dev -- --port 5174 --host", env: { NODE_ENV: "production" } },
        { name: "participate", cwd: "./apps/participate", script: "pnpm", args: "dev -- --port 5175 --host", env: { NODE_ENV: "production" } }
    ]
}