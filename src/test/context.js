const { randomBytes } = require("crypto");
const { default: migrate } = require("node-pg-migrate");
const format = require("pg-format");
const pool = require("../pool");
require("dotenv/config");

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = process.env;

const DEFAULT_OPTS = {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  database: `${DATABASE_NAME}-test`,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
};

class Context {
  static async build() {
    const roleName = "a" + randomBytes(4).toString("hex");

    await pool.connect(DEFAULT_OPTS);

    await pool.query(
      format("CREATE ROLE %I WITH LOGIN PASSWORD %L;", roleName, roleName),
    );

    await pool.query(
      format("CREATE SCHEMA %I AUTHORIZATION %I;", roleName, roleName),
    );

    await pool.close();

    await migrate({
      schema: roleName,
      direction: "up",
      log: () => {},
      noLock: true,
      dir: "migrations",
      databaseUrl: {
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        database: `${DATABASE_NAME}-test`,
        user: roleName,
        password: roleName,
      },
    });

    await pool.connect({
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      database: `${DATABASE_NAME}-test`,
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async reset() {
    return pool.query(`
      DELETE FROM users;
    `);
  }

  async close() {
    await pool.close();

    await pool.connect(DEFAULT_OPTS);

    await pool.query(format("DROP SCHEMA %I CASCADE;", this.roleName));

    await pool.query(format("DROP ROLE %I;", this.roleName));

    await pool.close();
  }
}

module.exports = Context;
