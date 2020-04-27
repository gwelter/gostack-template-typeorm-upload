import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce<Balance>(
      (grouper: Balance, current: Transaction) => {
        return {
          ...grouper,
          [current.type]: grouper[current.type] + current.value,
        };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
