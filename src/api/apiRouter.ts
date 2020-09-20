import express from "express";
import { type } from "os";
import pool from "../db";

const apiRouter = express.Router();

/** TODO:
 * Implement routing the API calls to the appropriate handler for serving your requests
 *
 * You may structure and implement this anyway you'd like, both code-wise and in terms of
 * the structure of your directory.
 *
 */

function toTitle(name: string) {
  let text = name.toLowerCase().split(" ");

  for (let i = 0; i < text.length; i++) {
    text[i] = text[i].replace(
      text[i].charAt(0),
      text[i].charAt(0).toUpperCase()
    );
  }
  return text.join(" ");
}

//GET: Tickets
apiRouter.get("/tickets", async (req, res) => {
  try {
    const tickets = await pool.query("SELECT * FROM tickets");
    res.json(tickets.rows);
  } catch (error) {
    console.error(error.message);
  }
});

//GET By Id: tickets/id
apiRouter.get("/tickets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await pool.query("SELECT * FROM tickets WHERE id = $1", [
      id,
    ]);

    if (ticket.rowCount > 0) {
      res.json(ticket.rows[0]);
    } else {
      res.status(400).send({ message: `Ticket with ${id} not found` });
    }
  } catch (error) {
    console.error(error.message);
  }
});

//GET Events: /events?category=&memberOnly=&name=
apiRouter.get("/events", async (req, res) => {
  try {
    let { category, memberOnly, name } = req.query;

    if (category) category = toTitle(category.toString());
    if (name) name = toTitle(name.toString());

    if (!category && !memberOnly && !name) {
      const events = await pool.query("SELECT * FROM events");
      res.json(events.rows);
    } else if (category && !memberOnly && !name) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE category=$1",
        [category]
      );
      res.json(filteredEvents.rows);
    } else if (category && !memberOnly && name) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE category=$1 AND event_name like $2",
        [category, "%" + name + "%"]
      );
      res.json(filteredEvents.rows);
    } else if (category && memberOnly && !name) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE category=$1 AND member_only=$2",
        [category, memberOnly]
      );
      res.json(filteredEvents.rows);
    } else if (!name && !category && memberOnly) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE member_only=$1",
        [memberOnly]
      );
      res.json(filteredEvents.rows);
    } else if (name && !category && memberOnly) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE member_only=$1 AND event_name like $2",
        [memberOnly, "%" + name + "%"]
      );
      res.json(filteredEvents.rows);
    } else if (!category && !memberOnly && name) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE event_name like $1",
        ["%" + name + "%"]
      );
      res.json(filteredEvents.rows);
    } else if (category && memberOnly && name) {
      const filteredEvents = await pool.query(
        "SELECT * FROM events WHERE category=$1 AND member_only=$2 AND event_name like $3",
        [category, memberOnly, "%" + name + "%"]
      );
      res.json(filteredEvents.rows);
    }
  } catch (error) {
    console.error(error.message);
  }
});

//GET By Id: events/id
apiRouter.get("/events/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const event = await pool.query("SELECT * FROM events WHERE id = $1", [id]);

    if (event.rowCount > 0) {
      res.json(event.rows[0]);
    } else {
      res.status(400).send({ message: `Event with ${id} not found` });
    }
  } catch (error) {
    console.error(error.message);
  }
});


//POST: api/order
apiRouter.post("/order", async (req, res) => {
  try {
    const {
      customer_name,
      event_id,
      ticket_type_id,
      ticket_quantity,
    } = req.body;

    let isMemberPruchase: boolean;
    let id: number;
    let datePlaced;

    const event_exist = await pool.query("SELECT * FROM events WHERE id=$1", [
      event_id,
    ]);

    const ticket_type_exist = await pool.query(
      "SELECT * FROM tickets WHERE id=$1",
      [ticket_type_id]
    );

    if (ticket_type_exist.rowCount > 0 && event_exist.rowCount > 0) {
      if (ticket_quantity > ticket_type_exist.rows[0].max_purchasable) {
        res.status(400).send({ message: "Ticket quantity limit exceeded" });
      } else {
        isMemberPruchase = true;
        const orderCount = await pool.query("SELECT * FROM orders");
        id = orderCount.rowCount + 1;
        datePlaced = new Date();
      }
    } else {
      res.status(400).send({
        message: `Ticket ID or event ID is not available for purchase`,
      });
    }

    const newOrder = await pool.query(
      "INSERT INTO orders (id,date_placed,customer_name, event_id, ticket_type_id, ticket_quantity, is_member_purchase) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        id,
        datePlaced,
        customer_name,
        event_id,
        ticket_type_id,
        ticket_quantity,
        isMemberPruchase,
      ]
    );

    res.json(newOrder.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

export default apiRouter;
