import { serve, Status } from "https://deno.land/std@0.119.0/http/mod.ts";

const SECRET_KEY = Deno.env.get("SECRET_KEY");

if (!SECRET_KEY) {
  throw new Error("Environment variable SECRET_KEY is not set!");
}

const encoder = new TextEncoder();

const secret = await crypto.subtle.importKey(
  "raw",
  encoder.encode(SECRET_KEY),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"],
);

async function getHmac(message: string) {
  const signature = await crypto.subtle.sign(
    secret.algorithm,
    secret,
    encoder.encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
}

async function handleRequest(req: Request) {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: Status.MethodNotAllowed,
      });
    }

    const headerRequire = [
      "Twitch-Eventsub-Message-Id",
      "Twitch-Eventsub-Message-Timestamp",
      "Twitch-Eventsub-Message-Type",
      "Twitch-Eventsub-Message-Signature",
    ];

    for (const header in headerRequire) {
      if (!req.headers.has(header)) {
        return new Response(`Please provide ${header} header`, {
          status: Status.BadRequest,
        });
      }
    }

    const body = await req.text();

    const signature = req.headers.get("Twitch-Eventsub-Message-Signature")!
      .replace("sha256=", "");

    const message = req.headers.get("Twitch-Eventsub-Message-Id")! +
      req.headers.get("Twitch-Eventsub-Message-Timestamp")! +
      body;

    const hmac = await getHmac(message);

    if (signature === hmac) {
      const notification = JSON.parse(body);
      const messageType = req.headers.get("Twitch-Eventsub-Message-Type");

      switch (messageType) {
        case "notification":
          // TODO: Do something with the event's data.

          console.log(`Event type: ${notification.subscription.type}`);
          console.log(JSON.stringify(notification.event, null, 4));

          return new Response(null, { status: Status.NoContent });
        case "webhook_callback_verification":
          return new Response(notification.challenge, {
            status: Status.OK,
            headers: { "content-type": "text/plain" },
          });
        case "revocation":
          return new Response(null, { status: Status.NoContent });
        default:
          return new Response(null, { status: Status.BadRequest });
      }
    } else {
      return new Response(null, { status: Status.Forbidden });
    }
  } catch (err) {
    return new Response(`Internal Server Error\n\n${err.message}`, {
      status: Status.InternalServerError,
    });
  }
}

serve(handleRequest);
