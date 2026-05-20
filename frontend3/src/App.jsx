import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'https://etype-backend.onrender.com'

function App() {

  const [telegramUser, setTelegramUser] =
    useState(null)

  const [materials, setMaterials] =
    useState([])

  const [history, setHistory] =
    useState([])

  const [quantities, setQuantities] =
  useState({})

  useEffect(() => {

  console.log(window.Telegram)

  const tg =
    window.Telegram?.WebApp

  console.log(tg)

  if (
    tg &&
    tg.initDataUnsafe &&
    tg.initDataUnsafe.user
  ) {

    tg.ready()

    const user =
      tg.initDataUnsafe.user

    console.log(user)

    setTelegramUser(user)

  } else {

   console.log(
      'TELEGRAM USER NOT FOUND'
    )

  }

}, [])

  useEffect(() => {

    if (!telegramUser) return

    loadStock()

    loadHistory()

  }, [telegramUser])

  async function loadStock() {

    try {

      const response =
        await axios.post(
          `${API}/my-stock`,
          {
            telegramId:
              telegramUser.id
          }
        )

      console.log(response.data)

      setMaterials(response.data)

    } catch (error) {

      console.log(error)

    }

  }

  async function loadHistory() {

    try {

      const response =
        await axios.post(
          `${API}/history`,
          {
            telegramId:
              telegramUser.id
          }
        )

      setHistory(response.data)

    } catch (error) {

      console.log(error)

    }

  }

  async function writeoff(
  productId,
  quantity
) 
{

    try {

      await axios.post(
        `${API}/writeoff`,
        {
          telegramId:
            telegramUser.id,

          productId,

          quantity
        }
      )

      await loadStock()

      await loadHistory()

      alert('Материал списан')

    } catch (error) {

      console.log(error)

      alert('Ошибка списания')

    }

  }

  return (

    <div
      style={{
        padding: 20,
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white',
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
              marginBottom: 30
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
        materials.map(product => (

          <div
            key={product.id}
            style={{
              border: '1px solid gray',
              padding: 15,
              borderRadius: 10,
              marginBottom: 15
            }}
          >

            <h3>
              {product.name}
            </h3>

            <div>
              Остаток:
              {' '}
              {product.stock}
            </div>

            <div
  style={{
    display: 'flex',
    gap: 10,
    marginTop: 10,
    alignItems: 'center'
  }}
>

  <button
    onClick={() => {

      const current =
        quantities[product.id] || 1

      if (current <= 1) return

      setQuantities({
        ...quantities,
        [product.id]:
          current - 1
      })

    }}
  >
    -
  </button>

  <div>
    {
      quantities[product.id] || 1
    }
  </div>

  <button
    onClick={() => {

      const current =
        quantities[product.id] || 1

      setQuantities({
        ...quantities,
        [product.id]:
          current + 1
      })

    }}
  >
    +
  </button>

  <button
    onClick={() =>
      writeoff(
        product.id,
        quantities[product.id] || 1
      )
    }
    style={{
      padding:
        '10px 15px',

      cursor: 'pointer'
    }}
  >
    Списать
  </button>

</div>

      <h2
        style={{
          marginTop: 40
        }}
      >
        История списаний
      </h2>

      {
        history.map(item => (

          <div
            key={item.id}
            style={{
              border: '1px solid gray',
              padding: 15,
              borderRadius: 10,
              marginBottom: 15
            }}
          >

            <div>
              {item.productName}
            </div>

            <div>
              Количество:
              {' '}
              {item.quantity}
            </div>

            <div>
              {item.date}
            </div>

          </div>

        ))
      }

    </div>

  )

}

export default App