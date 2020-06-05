import express from 'express';
import PointsController from './controllers/PointsController'
import ItensController from './controllers/ItensController'

const routes = express.Router();

routes.get('/items', ItensController.index);


routes.post('/points', PointsController.create);
routes.get('/points', PointsController.index);
routes.get('/points/:id', PointsController.show);

export default routes;