import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "ticket_order_db",
});

export default pool;
