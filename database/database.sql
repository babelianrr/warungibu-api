Table Users {
  id uuid [pk]
  name varchar [not null]
  phone varchar [not null, unique]
  email varchar [not null, unique]
  hashed_password varchar [not null]
  role varchar [default]
  provider varchar [not null]
  birth_date datetime
  gender varchar
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Authorizations {
  user_id uuid [ref: > Users.id]
  id int [pk, increment]
  token varchar [not null] 
  status_active boolean
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Outlets {
  id uuid
  name string
  type string
  npwp string
  telp string
  handphone string
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Addresses {
  id int [pk, increment]
  label varchar
  receiver_name varchar [not null]
  province varchar [not null]
  city varchar [not null]
  district varchar [not null]
  subdistrict varchar [not null]
  postal_code int [not null]
  full_address text [not null]
  phone_number varchar [not null]
  status enum // DELETED, ACTIVE
  is_main boolean
  notes text
  user_id int [ref: > Users.id]
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
  deleted_at timestamp
}

Table Accounts {
  id int [pk, increment]
  bank_name varchar [not null]
  account_number varchar [not null]
  account_name varchar [not null]
  branch_name varchar  
  user_id int [ref: > Users.id]
  status enum // DELETED, ACTIVE
  deleted_at timestamp
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Products {
  id int [pk, increment]
  name varchar
  picture_url varchar
  sku_number varchar
  brand varchar
  description text
  weight int
  slug varchar
  price int
  discount_percentage int
  discount_price int
  discount_type string // [percentage, price]
  satus enum //[ACTIVE, INACTIVE]
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Product_Category {
  id uuid [pk]
  product_id uuid [ref: > Products.id]
  category_id uuid [ref: > Catergories.id]
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Catergories {
  id uuid [pk]
  name varchar
  icon varchar
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

// Table Favorites {
//   id int [pk, increment]
//   product_id int [ref: > Products.id]
//   user_id int [ref: > Users.id]
//   status enum //[DELETED, ACTIVE]
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }

// // bisa jadi gak kepake
// Table Stocks {
//   id int [pk, increment]
//   product_id int [ref: > Products.id]
//   location varchar
//   stock_in int
//   stock_out int
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }

Table Carts {
  id int [pk, increment]
  user_id int [ref: > Users.id]
  product_id int [ref: > Products.id]
  location varchar // buat nge cek stok per lokasi
  quantity int
  status varchar // [DELETE, ACTIVE, ORDERED]
  final_unit_price int
  order_id uui [ref: > Orders.id]
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Orders {
  id int [pk, increment]
  user_id int [ref: > Users.id]
  status varchar [note: 'ORDERED, PAID, CANCELED, PROCESSED, COMPLETED']
  shipment_id int [ref: > Shipments.id]
  payment_id int [ref: > Payments.id]
  expired timestamp
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Shipments {
  id int [pk, increment]
  address_id int [ref: > Addresses.id]
  courier varchar
  track_number varchar
  delivery_date timestamp
  receive_date timestamp
  receiver_name varchar
  location varchar //?
  price int
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}

Table Payments {
  id int [pk, increment]
  status varchar [note: 'PAID, UNPAID']
  total_price int
  payment_method varchar
  payment_id varchar
  events json
  paid_at timestamp
  created timestamp [default: 'now()']
  updated timestamp [default: 'now()']
}


// Table Rates {
//   id int [pk, increment]
//   user_id int [ref: > Users.id]
//   product_id int [ref: > Products.id]
//   order_id int [ref: > Orders.id]
//   rating int
//   review text
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }


// Table Notifications {
//   id uuid
//   user_id uuid
//   type enum [note: 'ORDER_CREATED, ORDER_DEVERED, ORDER_COMPLETED, CANCELED, PAYMENT_SUCCESS, PAYMENT_FAILED']
//   message text
//   order_id uuid
//   email_sent boolean
//   notif_seen boolean
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }

// Table Flash_sales {
//   id uuid
//   start_time timestamp
//   end_time timestamp
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }

// Table Flash_sales_product {
//   id uuid
//   product_id uuid
//   Flash_sales_id uuid [ref: > Flash_sales.id]
//   created timestamp [default: 'now()']
//   updated timestamp [default: 'now()']
// }


Ref: "Products"."id" < "Products"."name"