# Ontology web app

Available at [https://ontology.tbta.bible](https://ontology.tbta.bible)

## API

`https://ontology.tbta.bible/search?q=love[&scope=[**stems**|glosses|all]]`

`http://localhost.tbta.bible:5173/simplification_hints?complex_term=disciple`

## Local development

`pnpm i`

### Running locally

#### 1. Load the database

Dump files can be found in https://github.com/presciencelabs/tabitha-databases/tree/main/databases

Running the following command will load the data locally:

`wrangler d1 execute <DB_NAME_FROM_WRANGLER_TOML_FILE> --file=<DB_NAME_FROM_WRANGLER_TOML_FILE>.tabitha.sqlite.sql`

#### 2. Configure local auth

Grab relevant OAuth keys from a teammate's `.env.local` file and add them to your local `.env.local` file.

#### 3. Start the app

> `pnpm build` will need to be run the first time only.

```bash
pnpm dev
```

The site should then be available here: [http://localhost.tbta.bible:5173](http://localhost.tbta.bible:5173)

### Static analysis

```bash
pnpm check
```

### Testing locally

> `pnpm exec playwright install` will need to be run at least once to get the headless browsers for testing.

```bash
pnpm test:e2e
```

🐛 debugging tests can be done with `pnpm test:e2e:dev`.

### Contributing

Always start your work in a new branch.

Run the following command as a last check before opening a PR

```bash
pnpm precommit
```

## Error handling

TODO: will integrate Sentry once https://github.com/getsentry/sentry-javascript/issues/8291 is fixed.
