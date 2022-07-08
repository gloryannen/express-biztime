process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let companiesTest;

beforeEach(async () => {
  const results = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('testComp', 'Test Company', 'For Testing.') RETURNING code, name, description`
  );
  companiesTest = results.rows[0];
});

afterEach(async () => {
  await db.query(`Delete from companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("GET a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [companiesTest],
    });
  });
});

describe("GET /1", function () {
  test("GET a list with one company", async function () {
    const response = await request(app).get("/companies/testComp");
    expect(response.body).toEqual({ company: companiesTest });
  });

  test("Responds with 404 for invalid company", async function () {
    const response = await request(app).get("/companies/invalid");
    expect(response.status).toEqual(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ name: "TestV2", description: "Just another test company" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "testv2",
        name: "TestV2",
        description: "Just another test company",
      },
    });
  });
});

describe("PUT /", function () {
  test("Updates a single company", async function () {
    const res = await request(app)
      .put("/companies/testComp")
      .send({ name: "BestTest", description: "Update of testComp" });
    expect(res.statusCode).toBe(204);
  });

  test("Checks for invalid company being updated", async function () {
    const res = await request(app).put("/companies/invalid");
    expect(res.status).toEqual(404);
  });
});

describe("DELETE /companies/:id", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/testComp`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });
});
