# Zwiggato API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "customer"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Current User
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### Users

#### Get Profile
- **GET** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "9876543210"
  }
  ```

#### Get Orders
- **GET** `/users/orders?page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`

#### Add Address
- **POST** `/users/address`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India",
    "isDefault": true,
    "label": "Home"
  }
  ```

### Restaurants

#### Get All Restaurants
- **GET** `/restaurants?search=pizza&cuisineType=Italian&minRating=4&page=1&limit=10`

#### Get Restaurant by ID
- **GET** `/restaurants/:id`

#### Get Restaurant Menu
- **GET** `/restaurants/:id/menu?category=Main Course&available=true`

### Menu

#### Create Menu Item
- **POST** `/menu`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "restaurantId": "restaurant_id",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato and mozzarella",
    "price": 299,
    "category": "Main Course",
    "dietaryTags": ["Vegetarian"],
    "preparationTime": 20
  }
  ```

### Orders

#### Create Order
- **POST** `/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "restaurantId": "restaurant_id",
    "orderItems": [
      {
        "menuItemId": "menu_item_id",
        "quantity": 2,
        "specialInstructions": "Extra cheese"
      }
    ],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001"
    },
    "paymentMethod": "COD"
  }
  ```

#### Get Order
- **GET** `/orders/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Update Order Status
- **PUT** `/orders/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "status": "Preparing"
  }
  ```

### Reviews

#### Submit Review
- **POST** `/reviews`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "restaurantId": "restaurant_id",
    "orderId": "order_id",
    "rating": 5,
    "comment": "Great food!",
    "foodRating": 5,
    "deliveryRating": 4
  }
  ```

#### Get Restaurant Reviews
- **GET** `/reviews/restaurant/:restaurantId?page=1&limit=10`

### Coupons

#### Validate Coupon
- **POST** `/coupons/validate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "code": "WELCOME10",
    "orderAmount": 500,
    "restaurantId": "restaurant_id"
  }
  ```

#### Apply Coupon
- **POST** `/coupons/apply`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "code": "WELCOME10",
    "orderId": "order_id"
  }
  ```

#### Get Active Coupons
- **GET** `/coupons?restaurantId=restaurant_id`

### Notifications

#### Get Notifications
- **GET** `/notifications?page=1&limit=20&unreadOnly=false`
- **Headers:** `Authorization: Bearer <token>`

#### Mark as Read
- **PUT** `/notifications/:id/read`
- **Headers:** `Authorization: Bearer <token>`

#### Mark All as Read
- **PUT** `/notifications/read-all`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Notification
- **DELETE** `/notifications/:id`
- **Headers:** `Authorization: Bearer <token>`

### Recommendations

#### Get Personalized Recommendations
- **GET** `/recommendations?limit=10`
- **Headers:** `Authorization: Bearer <token>`

#### Get Trending Restaurants
- **GET** `/recommendations/trending?limit=10&days=7`

### Orders (Enhanced)

#### Reorder Previous Order
- **POST** `/orders/:id/reorder`
- **Headers:** `Authorization: Bearer <token>`

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

