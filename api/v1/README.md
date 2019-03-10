# my-travels

### API documentation

**Python Dependencies**

- Python 3.x

- psycopg2

- flask

- flask_cors

### database schema

**Places table**

`http://<domain:port>/api/v1/locations/all`
`http://<domain:port>/api/v1/locations?<query string>`

| Column | data-type | desc
---|---| ---
**id** | **INTEGER (primary_key)**| **unique location identifier**
**type** | **TEXT** | **`(Brewery|Cidery|Winery|Sightseeing|Travel|Lodging|Park|Bar|Restaurant|Store|Museum|Concert)`**
address | TEXT | address of place
**city** | **TEXT** | **city of place**
**state** | **TEXT (2)** | **state of place**
zip | INTEGER (5) | postal code of place
**name** | **TEXT** | **name of place**
lat | DOUBLE | latitude coordinate of place
long | DOUBLE | longitude coordinate of place
**trip_id** | **INTEGER (foreign_key)** | **id of trip that place was visited during**

**Bold denotes possible endpoint parameter**

**Trips table**

`http://<domain:port>/api/v1/trips/all`
`http://<domain:port>/api/v1/trips?<query string>`

| Column | data-type | desc
---|---| ---
**id** | **INTEGER (primary_key) (foreign_key)**| **unique trip identifier**
**place** | **TEXT** | **primary trip location**
**state** | **TEXT (2)** | **state of primary trip location**
**type** | **TEXT** | **`(Holiday|Vacation|Professional|Race|Concert)`**
start | DATE | start date of trip
**duration** | **INTEGER** | **duration of trip**]

**Bold denotes possible endpoint parameter**




