# Twitch EventSub using Deno

This example shows how to manage eventsub requests in Deno.

[![Deploy this example](https://deno.com/deno-deploy-button.svg)](https://dash.deno.com/new?url=https://raw.githubusercontent.com/ablause/deno-twitch-eventsub/mod.ts)

## How to use

### Generate UUID

In deno environment:

```sh
crypto.randomUUID()
```

### Set environment (for local)

```sh
export SECRET_KEY=<randomUUID>
```

## Run Local

You can run the example program on your machine using
[`deno`](https://github.com/denoland/deno):

```sh
deno run https://raw.githubusercontent.com/ablause/deno-twitch-eventsub/mod.ts
```

## Testing

```sh
twitch event verify-subscription subscribe -F http://localhost:8000 -s $SECRET_KEY
```
