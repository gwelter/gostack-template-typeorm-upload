import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsReadStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = transactionsReadStream.pipe(parseStream);
    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', (line: string[]) => {
      const [title, type, value, category] = line;

      if (type === 'income' || type === 'outcome') {
        transactions.push({
          title,
          type,
          value: parseInt(value, 10),
          category,
        });
      }
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    fs.promises.unlink(filePath);

    const transactionsRepository = getRepository(Transaction);
    const categoryRepository = getCustomRepository(CategoriesRepository);
    const toBeCreated = await Promise.all(
      transactions.map(async transaction => ({
        ...transaction,
        category: await categoryRepository.findOneOrCreate(
          transaction.category,
        ),
      })),
    );

    const t = transactionsRepository.create(toBeCreated);
    await transactionsRepository.save(t);
    return t;
  }
}

export default ImportTransactionsService;
