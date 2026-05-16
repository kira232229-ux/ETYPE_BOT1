import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

import {
  getProducts,
  getStockByStore,
  getWriteoffHistory,
  createWriteoff
} from './services/moysklad.js';

import { workers } from './data/workers.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Главная страница
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
  res.json({
    message: 'Backend works!',
  });
});

/*
|--------------------------------------------------------------------------
| Получение всех товаров
|--------------------------------------------------------------------------
*/

app.get('/products', async (req, res) => {
  try {
    const data = await getProducts();

    res.json(data);
  } catch (error) {
    console.log(
  error.response?.data ||
  error.message
);

    res.status(500).json({
      error: 'Products error',
    });
  }
});

/*
|--------------------------------------------------------------------------
| Получение организаций
|--------------------------------------------------------------------------
*/

app.get('/test-org', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.moysklad.ru/api/remap/1.2/entity/organization',
      {
        headers: {
          Authorization:
            `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Organization error',
    });
  }
});

/*
|--------------------------------------------------------------------------
| Получение складов
|--------------------------------------------------------------------------
*/

app.get('/test-store', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.moysklad.ru/api/remap/1.2/entity/store',
      {
        headers: {
          Authorization:
            `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Store error',
    });
  }
});

/*
|--------------------------------------------------------------------------
| Авторизация монтажника
|--------------------------------------------------------------------------
*/

app.post('/auth', async (req, res) => {
  try {
    const { telegramId } = req.body;

    const worker = workers.find(
      user => user.telegramId === telegramId
    );

    if (!worker) {
      return res.status(404).json({
        error: 'Worker not found',
      });
    }

    res.json(worker);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: 'Auth error',
    });
  }
});

/*
|--------------------------------------------------------------------------
| Остатки монтажника
|--------------------------------------------------------------------------
*/

app.post('/my-stock', async (req, res) => {
  try {
    const { telegramId } = req.body;

    const worker = workers.find(
      user => user.telegramId === telegramId
    );

    if (!worker) {
      return res.status(404).json({
        error: 'Worker not found',
      });
    }

    const stock =
      await getStockByStore();

    res.json(stock);
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Stock error',
    });
  }
});
app.get('/test-stock', async (req, res) => {
  try {

    const worker = workers[0];

    const stock =
      await getStockByStore(
        worker.storeId
      );

    res.json(stock);

  } catch (error) {

    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Test stock error',
    });

  }
});

/*
|--------------------------------------------------------------------------
| Списание материалов
|--------------------------------------------------------------------------
*/

app.post('/writeoff', async (req, res) => {

  try {

    console.log('WRITEOFF REQUEST');

    console.log(req.body);

    const {
      productId,
      quantity
    } = req.body;

    const result =
      await createWriteoff(
        productId,
        quantity
      );

    res.json(result);

  } 
  catch (error) {

    console.log(
      'WRITEOFF ERROR'
    );

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: 'Writeoff error'
    });

  }

});

/*
|--------------------------------------------------------------------------
| История списаний
|--------------------------------------------------------------------------
*/
app.post('/history', async (req, res) => {
  try {
    const { telegramId } = req.body;

   

    /*
    ----------------------------------------------------------------------
    | Ищем монтажника
    ----------------------------------------------------------------------
    */

    const worker = workers.find(
      user => user.telegramId === telegramId
    );

    if (!worker) {
      return res.status(404).json({
        error: 'Worker not found',
      });
    }

    /*
    ----------------------------------------------------------------------
    | Получаем историю
    ----------------------------------------------------------------------
    */

    const history =
      await getWriteoffHistory(
        worker.storeId
      );

    res.json(history);
  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'History error',
    });
  }
});

/*
|--------------------------------------------------------------------------
| Запуск сервера
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT}`
  );
});