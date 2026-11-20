CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    comments TEXT
);

INSERT INTO books (book_id, title, author, comments)
VALUES
    (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the series'),
    (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the series'),
    (3, 'L''ingénue libertine', 'Colette', 'Minne and Les égarements de Minne')
ON CONFLICT (book_id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('books', 'book_id'),
    COALESCE(MAX(book_id), 1),
    MAX(book_id) IS NOT NULL
)
FROM books;
