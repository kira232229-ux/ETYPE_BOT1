import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {

  const API =
    'http://127.0.0.1:3000'

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [stock, setStock] =
    useState([])

  const [selectedProduct,
    setSelectedProduct] =
    useState(null)

  const [quantity,
    setQuantity] =
    useState(1)

  const [history,
    setHistory] =
    useState([])
    
  const [telegramUser,
  setTelegramUser] =
  useState(null)

  /*
  |--------------------------------------------------------------------------
  | Загрузка материалов
  |--------------------------------------------------------------------------
  */

  async function loadStock() {

    try {

      const response =
        await axios.post(
          `${API}/my-stock`,
          {
            telegramId: telegramUser?.id
          }
        )

      if (Array.isArray(response.data)) {

  setStock(response.data)

} else {

  setStock([])

}

    } catch (error) {

      console.log(error)

    }

  }

  /*
  |--------------------------------------------------------------------------
  | История списаний
  |--------------------------------------------------------------------------
  */

  async function loadHistory() {

    try {

      const response =
        await axios.post(
          `${API}/history`,
          {
            telegramId: telegramUser?.id
          }
        )

      if (Array.isArray(response.data)) {

  setHistory(response.data)

} else {

  setHistory([])

}

    } catch (error) {

      console.log(error)

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Загрузка при старте
  |--------------------------------------------------------------------------
  */

 useEffect(() => {

  const tg =
    window.Telegram.WebApp

  tg.ready()

  const user =
    tg.initDataUnsafe?.user

  console.log(user)

  setTelegramUser(user)

}, [])
useEffect(() => {

  if (!telegramUser) return

  loadStock()

  loadHistory()

}, [telegramUser])
  /*
  |--------------------------------------------------------------------------
  | Списание
  |--------------------------------------------------------------------------
  */

  async function writeoff() {

    if (!selectedProduct) {

      alert(
        'Выберите материал'
      )

      return
    }

    try {

      await axios.post(
        `${API}/writeoff`,
        {
           telegramId:
      telegramUser?.id,
      
          productId:
            selectedProduct.id,

          quantity:
            Number(quantity)
        }
      )

      alert(
        'Материал списан'
      )

      loadStock()

      loadHistory()

    } catch (error) {

      console.log(error)

      alert(
        'Ошибка списания'
      )

    }

  }

  return (

    <div
      style={{
        padding: 20,
        fontFamily: 'Arial'
      }}
    >

      <h1>
        Склад монтажника
      </h1>
{
  telegramUser && (

    <div
      style={{
        marginBottom: 20
      }}
    >

      <div>
        ID:
        {' '}
        {telegramUser.id}
      </div>

      <div>
        Имя:
        {' '}
        {telegramUser.first_name}
      </div>

      <div>
        Username:
        {' '}
        @{telegramUser.username}
      </div>

    </div>

  )
}
      <h2>
        Материалы
      </h2>

      {
        stock.map((item, index) => (

          <div
            key={index}
            onClick={() =>
              setSelectedProduct(item)
            }
            style={{

              border:
                selectedProduct?.id === item.id
                  ? '2px solid green'
                  : '1px solid #ccc',

              borderRadius: 10,

              padding: 10,

              marginBottom: 10,

              cursor: 'pointer'
            }}
          >

            <div>
              <b>
                {item.name}
              </b>
            </div>

            <div>
              Остаток:
              {' '}
              {item.quantity}
            </div>

            <div>
              Цена:
              {' '}
              {item.price}
            </div>

          </div>

        ))
      }

      <div
        style={{
          marginTop: 20
        }}
      >

        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              e.target.value
            )
          }
          style={{
            padding: 10,
            width: 100
          }}
        />

      </div>

      <button
        onClick={writeoff}
        style={{
          marginTop: 20,
          padding:
            '12px 20px',

          cursor: 'pointer'
        }}
      >

        Списать материал

      </button>

      <h2
        style={{
          marginTop: 40
        }}
      >
        История списаний
      </h2>

      {
        history.map((item, index) => (

          <div
            key={index}
            style={{
              border:
                '1px solid #ccc',

              padding: 10,

              borderRadius: 10,

              marginBottom: 10
            }}
          >

            <div>
              ID:
              {' '}
              {item.id}
            </div>

            <div>
              Дата:
              {' '}
              {item.date}
            </div>

            <div>
              Проведен:
              {' '}
              {
                item.applicable
                  ? 'Да'
                  : 'Нет'
              }
            </div>

          </div>

        ))
      }

    </div>

  )
}

export default App