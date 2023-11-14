// @ts-check
import { homedir } from "node:os";
import { resolve } from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const DB_PATH = resolve(homedir(), "Library/Messages/chat.db");
const MINUTES = 5;

const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database,
});

const messages = await db.all(`
  select * from message 
  where message.is_from_me = 0
    and message.text is not null
    and length(message.text) > 0
    and datetime(message.date / 1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') >= datetime('now', '-${MINUTES} minutes', 'localtime')
`);

const codes = messages
  .map((message) => {
    // 🤷‍♂️
    const [code] = message.text.match(/\d{4,}/) || [];

    return code;
  })
  .filter(Boolean);

console.log(
  JSON.stringify({
    items: codes.length
      ? codes.map((code) => ({
          title: code,
        }))
      : [{ title: `No results in last ${MINUTES} mins` }],
  })
);
