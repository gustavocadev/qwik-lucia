# Username & password example with Lucia and Qwik City

This example uses `pg` and Drizzle ORM.

```bash
# install dependencies
pnpm i

# run drizzle kit
pnpm db:push

# run dev server
pnpm dev
```

## Runtime

This example is built for Node.js 20. If you're using Node.js 16/18, un-comment the following lines in `auth/lucia.ts`:

```ts
// import "lucia/polyfill/node";
```

## User schema

| id           | type     | unique |
| ------------ | -------- | :----: |
| `id`         | `string` |        |
| `username`   | `string` |   ✓    |
| `names`      | `string` |        |
| `last_names` | `string` |        |
| `email`      | `string` |   ✓    |
