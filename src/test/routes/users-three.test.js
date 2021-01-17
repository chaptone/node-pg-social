const request = require("supertest");
const buildApp = require("../../app");
const pool = require("../../pool");
const UserRepo = require("../../repos/user-repo");

const { randomBytes } = require("crypto");
const { default: migrate } = require("node-pg-migrate");
const format = require("pg-format");

beforeAll(async () => {
  const roleName = "a" + randomBytes(4).toString("hex");

  await pool.connect({
    host: "localhost",
    port: 5432,
    database: "socialnetwork-test",
    user: "prisma",
    password: "prisma",
  });

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
      host: "localhost",
      port: 5432,
      database: "socialnetwork-test",
      user: roleName,
      password: roleName,
    },
  });

  await pool.connect({
    host: "localhost",
    port: 5432,
    database: "socialnetwork-test",
    user: roleName,
    password: roleName,
  });
});

afterAll(() => {
  return pool.close();
});

it("create a user", async () => {
  const startingCount = await UserRepo.count();

  await request(buildApp())
    .post("/users")
    .send({ username: "test user", bio: "test bio" })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount - startingCount).toEqual(1);
});
