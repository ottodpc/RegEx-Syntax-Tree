import React from "react";

interface Book {
  id: number;
  title: string;
  author: string;
}

interface BookListProps {
  books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {books.map((book) => (
        <div key={book.id} className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold">{book.title}</h3>
          <p className="text-sm text-gray-600">by {book.author}</p>
        </div>
      ))}
    </div>
  );
};

export default BookList;
