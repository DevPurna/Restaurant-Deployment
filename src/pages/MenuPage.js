import {useEffect, useState} from 'react'
import './MenuPage.css'

const DISHES_API_URL =
  'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'

function DishCard({dish, count, increment, decrement}) {
  const {
    id,
    name,
    image,
    currency,
    price,
    description,
    calories,
    availability,
    addonCat,
    type,
  } = dish

  const isVeg = type === 2

  return (
    <div className="dish-card">
      <div className="dish-left">
        <img
          className="dish-type-icon"
          src={
            isVeg
              ? 'https://img.icons8.com/color/48/vegetarian-food-symbol.png'
              : 'https://img.icons8.com/color/48/non-vegetarian-food-symbol.png'
          }
          alt={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        />
        <div className="dish-info">
          <h2 className="dish-name">{name}</h2>
          <p className="dish-price">
            {currency} {price}
          </p>
          <p className="dish-description">{description}</p>
          {addonCat?.length > 0 && (
            <p className="customizations">Customizations available</p>
          )}
          {availability ? (
            <div className="counter">
              <button
                type="button"
                onClick={() => decrement(id)}
                disabled={count === 0}
              >
                -
              </button>
              <span>{count}</span>
              <button type="button" onClick={() => increment(id)}>
                +
              </button>
            </div>
          ) : (
            <p className="not-available">Not Available</p>
          )}
        </div>
      </div>
      <div className="dish-right">
        <p className="calories">{calories} cal</p>
        <img className="dish-image" src={image} alt={name} />
      </div>
    </div>
  )
}

function MenuPage() {
  const [menuData, setMenuData] = useState([])
  const [restaurantName, setRestaurantName] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [dishCounts, setDishCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(DISHES_API_URL)
        const json = await res.json()
        const restaurant = json[0]

        // Convert snake_case API response to camelCase
        const menuList = restaurant.table_menu_list.map(category => ({
          menuCategoryId: category.menu_category_id,
          menuCategory: category.menu_category,
          categoryDishes: category.category_dishes.map(dish => ({
            id: dish.dish_id,
            name: dish.dish_name,
            image: dish.dish_image,
            currency: dish.dish_currency,
            price: dish.dish_price,
            description: dish.dish_description,
            calories: dish.dish_calories,
            availability: dish.dish_Availability,
            addonCat: dish.addonCat,
            type: dish.dish_Type,
          })),
        }))

        setRestaurantName(restaurant.restaurant_name)
        setMenuData(menuList)
        setActiveCategory(menuList[0]?.menuCategory || '')
      } catch (error) {
        console.error('Error fetching menu:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const increment = id =>
    setDishCounts(prev => ({...prev, [id]: (prev[id] || 0) + 1}))
  const decrement = id =>
    setDishCounts(prev => ({...prev, [id]: Math.max((prev[id] || 0) - 1, 0)}))

  const activeCategoryObj = menuData.find(
    cat => cat.menuCategory === activeCategory,
  )
  const cartCount = Object.values(dishCounts).reduce((acc, val) => acc + val, 0)

  if (loading) return <p className="loading">Loading menu...</p>

  return (
    <div className="menu-page">
      <nav className="header-nav">
        <h1 className="restaurant-name">{restaurantName}</h1>
        <div className="cart-info">
          <p>My Orders</p>
          <span className="cart-count">{cartCount}</span>
        </div>
      </nav>

      <div className="category-tabs">
        {menuData.map(cat => (
          <button
            type="button"
            key={cat.menuCategoryId}
            className={`category-btn ${
              activeCategory === cat.menuCategory ? 'active' : ''
            }`}
            onClick={() => setActiveCategory(cat.menuCategory)}
          >
            {cat.menuCategory}
          </button>
        ))}
      </div>

      <div className="dishes-list">
        {activeCategoryObj?.categoryDishes.map(dish => (
          <DishCard
            key={dish.id}
            dish={dish}
            count={dishCounts[dish.id] || 0}
            increment={increment}
            decrement={decrement}
          />
        ))}
      </div>
    </div>
  )
}

export default MenuPage
