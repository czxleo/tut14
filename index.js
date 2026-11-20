require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

function showDatabaseError(res, err) {
  console.error(err.message);
  return res.status(500).render("error", {
    message: "Database error: " + err.message
  });
}

function getValidId(idText) {
  const id = Number(idText);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getBookFields(body) {
  return {
    title: (body.title || "").trim(),
    author: (body.author || "").trim(),
    comments: (body.comments || "").trim()
  };
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/data", (req, res) => {
  res.render("data", {
    model: {
      title: "Example data",
      items: ["one", "two", "three"]
    }
  });
});

app.get("/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books ORDER BY title");
    res.render("books", { model: result.rows });
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.get("/create", (req, res) => {
  res.render("create", {
    model: { title: "", author: "", comments: "" }
  });
});

app.post("/create", async (req, res) => {
  const book = getBookFields(req.body);
  if (!book.title || !book.author) {
    return res.status(400).render("error", {
      message: "Title and author are required."
    });
  }

  try {
    const sql =
      "INSERT INTO books (title, author, comments) VALUES ($1, $2, $3)";
    await pool.query(sql, [book.title, book.author, book.comments]);
    res.redirect("/books");
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(404).render("error", { message: "Book not found." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE book_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }
    res.render("edit", { model: result.rows[0] });
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.post("/edit/:id", async (req, res) => {
  const id = getValidId(req.params.id);
  const book = getBookFields(req.body);
  if (!id) {
    return res.status(404).render("error", { message: "Book not found." });
  }
  if (!book.title || !book.author) {
    return res.status(400).render("error", {
      message: "Title and author are required."
    });
  }

  try {
    const sql =
      "UPDATE books SET title = $1, author = $2, comments = $3 " +
      "WHERE book_id = $4";
    const result = await pool.query(sql, [
      book.title,
      book.author,
      book.comments,
      id
    ]);
    if (result.rowCount === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }
    res.redirect("/books");
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.get("/delete/:id", async (req, res) => {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(404).render("error", { message: "Book not found." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE book_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }
    res.render("delete", { model: result.rows[0] });
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(404).render("error", { message: "Book not found." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE book_id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).render("error", { message: "Book not found." });
    }
    res.redirect("/books");
  } catch (err) {
    return showDatabaseError(res, err);
  }
});

app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started (http://localhost:" + port + "/) !");
});
