import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL =
  'https://api.moysklad.ru/api/remap/1.2';

const headers = {
  Authorization:
    `Bearer ${process.env.MOYSKLAD_TOKEN}`,

  'Content-Type':
    'application/json',
};

/*
|--------------------------------------------------------------------------
| Получение товаров
|--------------------------------------------------------------------------
*/

export async function getProducts() {

  const response = await axios.get(
    `${BASE_URL}/entity/product`,
    { headers }
  );

  return response.data.rows.map(product => ({

    id:
      product.id,

    name:
      product.name,

    article:
      product.article,

    code:
      product.code,

    price:
      product.salePrices?.[0]?.value / 100 || 0,

  }));

}

/*
|--------------------------------------------------------------------------
| Остатки
|--------------------------------------------------------------------------
*/

export async function getStockByStore(storeId) {

  const response = await axios.get(
    'https://api.moysklad.ru/api/remap/1.2/report/stock/all',
    {
      headers: {
        Authorization:
          `Bearer ${process.env.MOYSKLAD_TOKEN}`,
      },

      params: {
        filter:
          `store=${storeId}`,
      },
    }
  )

  const rows =
    response.data.rows || []

  return rows.map(item => ({

    id:
      item.meta.href
        .split('/')
        .pop()
        .split('?')[0],

    name:
      item.name,

    stock:
      item.stock,

    price:
      item.salePrice
        ? item.salePrice / 100
        : 0,

  }))

}
/*
|--------------------------------------------------------------------------
| Создание списания
|--------------------------------------------------------------------------
*/

export async function createWriteoff(
  productId,
  quantity
) {

  const response = await axios.post(

    `${BASE_URL}/entity/loss`,

    {

      organization: {
        meta: {
          href:
            `${BASE_URL}/entity/organization/${process.env.ORGANIZATION_ID}`,

          type:
            'organization',

          mediaType:
            'application/json',
        },
      },

      store: {
        meta: {
          href:
            `${BASE_URL}/entity/store/${process.env.STORE_ID}`,

          type:
            'store',

          mediaType:
            'application/json',
        },
      },

      positions: [
        {
          quantity,

          assortment: {
            meta: {
              href:
                `${BASE_URL}/entity/product/${productId}`,

              type:
                'product',

              mediaType:
                'application/json',
            },
          },
        },
      ],
    },

    { headers }

  );

  return response.data;

}

/*
|--------------------------------------------------------------------------
| История списаний
|--------------------------------------------------------------------------
*/

export async function getWriteoffHistory() {

  const response = await axios.get(
    `${BASE_URL}/entity/loss`,
    { headers }
  );

  return response.data.rows.map(item => ({

    id:
      item.id,

    date:
      item.moment,

    description:
      item.description,

    applicable:
      item.applicable

  }));

}