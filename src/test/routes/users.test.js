const request = require("supertest");
const buildApp = require("../../app");
const pool = require("../../pool");
const UserRepo = require("../../repos/user-repo");

beforeAll(() => {
  return pool.connect({
    host: "localhost",
    port: 5432,
    database: "socialnetwork-test",
    user: "prisma",
    password: "prisma",
  });
});

afterAll(() => {
  return pool.close();
});

it("create a user", async () => {
  const startingCount = await UserRepo.count();
  expect(startingCount).toEqual(0);

  await request(buildApp())
    .post("/users")
    .send({ username: "test user", bio: "test bio" })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount).toEqual(1);
});
