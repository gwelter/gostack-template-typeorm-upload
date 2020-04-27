import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transacationsRepository = getCustomRepository(TransactionsRepository);
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid transaction type');
    }

    const balance = await transacationsRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('No funds');
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const tag = await categoriesRepository.findOneOrCreate(category);

    const transaction = transacationsRepository.create({
      title,
      value,
      type,
      category: tag,
    });

    await transacationsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
