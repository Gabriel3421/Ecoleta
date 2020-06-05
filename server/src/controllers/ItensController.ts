import { Request, Response } from 'express';
import knex from '../database/connection';

class ItensController {
  async index (req: Request, res: Response) {
    const items = await knex('itens').select('*');
    const serializedItem = items.map( item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://localhost:3333/uploads/${item.image}`,
      }
    })
    return res.json(serializedItem);
  }
}

export default new ItensController();