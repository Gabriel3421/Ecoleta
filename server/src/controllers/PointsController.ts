import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index (req: Request, res: Response){
    const { city, uf, items} = req.query;

    const parsedItems = String(items)
    .split(',')
    .map( item => Number(item.trim()));

    const points = await knex('points')
    .join('point_itens', 'points.id', '=', 'point_itens.point_id')
    .whereIn('point_itens.item_id', parsedItems)
    .where('city', String(city)) 
    .where('uf', String(uf)) 
    .distinct()
    .select('points.*');
    return res.json(points)
  }

  async show (req: Request, res: Response){
    const { id } = req.params;
    const point = await knex('points').where('id', id).first();

    if(!point) {
      return res.status(404).json({message : 'Point not found.'})
    }

    const items = await knex("itens")
    .join('point_itens', 'itens.id', '=', 'point_itens.item_id')
    .where('point_itens.point_id', id)
    .select('itens.title');

    res.json({point, items});
  }

  async create (req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city, 
      uf, 
      items
    } = req.body;
  
    const trx = await knex.transaction();
   
    const ids = await trx('points').insert({
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city, 
      uf
    })
  
    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id: ids[0],
      }
    })
  
    await trx('point_itens').insert(pointItems);
    
    await trx.commit()
    return res.json({
      id: ids[0],
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city, 
      uf, 
    });
  }
}

export default new PointsController();