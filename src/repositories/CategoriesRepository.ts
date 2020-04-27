import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOneOrCreate(title: string): Promise<Category> {
    let tag = await this.findOne({
      where: { title },
    });

    if (!tag) {
      tag = this.create({ title });
      await this.save(tag);
    }
    return tag;
  }
}

export default CategoriesRepository;
