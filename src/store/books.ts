import data from "./database.json";

const getBooks = async () => {
  return Object.values(data).reduce(
    (acc: Array<any>, val) => acc.concat(val),
    []
  );
};

const getBooksPerLanguage = async (language: string): Promise<any> => {
  // @ts-ignore
  return data[language] || [];
};

const getLanguages = async () => {
  return Object.keys(data);
};

export { getBooks, getBooksPerLanguage, getLanguages };
