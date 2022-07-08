process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let invoiceTest;

beforeEach(async () => {
  await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('test', 'Test Company', 'For Testing.')`
  );
  const results = await db.query(
    `INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('test', 100, false, null) RETURNING id, comp_Code, amt, paid, paid_date`
  );
  invoiceTest = results.rows[0];
});

afterEach(async () => {
  await db.query(`TRUNCATE TABLE invoices RESTART IDENTITY;`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("GET a list with one invoice", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: [
        {
          add_date: "2022-07-08T04:00:00.000Z",
          amt: 100,
          comp_code: "test",
          id: 1,
          paid: false,
          paid_date: null,
        },
      ],
    });
  });
});

describe("GET /1", function () {
  test("GET a list with one invoice", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual({
      invoice: {
        add_date: "2022-07-08T04:00:00.000Z",
        amt: 100,
        id: 1,
        paid: false,
        paid_date: null,
        company: {
          code: "test",
          description: "For Testing.",
          name: "Test Company",
        },
      },
    });
  });

  test("Responds with 404 for invalid invoice", async function () {
    const response = await request(app).get("/invoices/999");
    expect(response.status).toEqual(404);
  });
});

describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({ amt: 999, comp_code: "test" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: "test",
        amt: 999,
        add_date: "2022-07-08T04:00:00.000Z",
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PUT /", function () {
  test("Updates a single invoice", async function () {
    const res = await request(app)
      .put("/invoices/1")
      .send({ amt: 1000, paid: false });
    expect(res.statusCode).toBe(204);
  });

  test("Checks for invalid invoice being updated", async function () {
    const res = await request(app).put("/invoices/9999");
    expect(res.status).toEqual(404);
  });
});

describe("DELETE /invoices/:id", () => {
  test("Deletes a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${invoiceTest.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });
});
