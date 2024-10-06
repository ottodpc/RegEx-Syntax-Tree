import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBooksPerLanguage } from "../store/books";

interface Book {
  title: string;
  author: string;
  link: string;
}

const BooksPage: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      // @ts-ignore
      const books = await getBooksPerLanguage(lang);
      setBooks(books);
    };

    fetchBooks();
  }, [lang]);

  return (
    <div className="books p-16">
      <div className="title text-center font-bold text-3xl mb-16">
        {/* @ts-ignore */}
        {lang.charAt(0).toUpperCase() + lang.slice(1)} Books
      </div>
      <div className="books-cards flex flex-wrap">
        {books.map((book) => (
          <a
            href={`https://www.gutenberg.org/ebooks/${book.link}`}
            target="_blank"
            rel="noopener noreferrer"
            key={book.title}
            className="book no-underline text-black m-4"
          >
            <div className="book-content flex justify-between bg-white p-8 rounded-lg shadow-md w-80">
              <div>
                <div className="book-title font-bold">{book.title}</div>
                <div className="book-author italic text-gray-600">
                  {book.author}
                </div>
              </div>
              <div className="book-cover">
                <img
                  src={`https://www.gutenberg.org/cache/epub/${book.link}/pg${book.link}.cover.medium.jpg`}
                  alt={book.title}
                  className="h-40"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BooksPage;
