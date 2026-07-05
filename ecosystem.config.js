export default {
  apps: [
    {
      name: "notes-api",
      script: "index.js",
      instances: 4,
      exec_mode: "cluster",
      max_memory_restart: "300M",
    },
  ],
};
