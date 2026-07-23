const CONSUL_URL = process.env.CONSUL_URL || "http://consul:8500";
const SERVICE_ID = "user-service-1";

export async function registerWithConsul(port: number) {
  const payload = {
    ID: SERVICE_ID,
    Name: "user-service",
    Address: "user-service",
    Port: port,
    Check: {
      HTTP: `http://user-service:${port}/health`,
      Interval: "10s",
    },
  };

  try {
    const res = await fetch(`${CONSUL_URL}/v1/agent/service/register`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Consul responded with ${res.status}`);
    console.log("Registered with Consul as user-service");
  } catch (err: any) {
    console.warn(
      "Could not register with Consul (continuing anyway):",
      err.message,
    );
  }
}

export async function deregisterFromConsul() {
  try {
    await fetch(`${CONSUL_URL}/v1/agent/service/deregister/${SERVICE_ID}`, {
      method: "PUT",
    });
  } catch {
    // best-effort on shutdown, don't block process exit
  }
}
