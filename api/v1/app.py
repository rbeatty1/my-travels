from flask import Flask, render_template, request
from flask_cors import CORS
import psycopg2 as psql
import json


app = Flask(__name__)
CORS(app)

@app.route('/<name>')
def greeting(name=None):
    return render_template('hello.html', name=name)

@app.route('/api/locations/all', methods=["GET"])
def get_places():
    con = psql.connect('host=localhost port=5432 dbname=mytravel user=postgres password=postgres')
    cur = con.cursor()
    cur.execute('SELECT * FROM places')
    payload = {
        "type": "FeatureCollection",
        "features": [],
        "crs": {
            "type": "name",
            "properties": {
              "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        }
    }
    for r in cur.fetchall():
        cargo = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r[8], r[7]]
            },
            "properties": {
                "id": r[0],
                "name": r[6],
                "type": r[1],
                "address": r[2],
                "city" : r[3],
                "state": r[4],
                "zip": r[5],
                "trip": r[9]
            }
        }
        payload["features"].append(cargo)
    return json.dumps(payload)

@app.route('/api/locations', methods=["GET"])
def query_places():
    args = request.args
    ## create parameter object to create query
    params = {
        'name': '{}'.format(args.get('name')),
        'type': '{}'.format(args.get('type')),
        'trip_id': int(args.get('trip_id')),
        'city': '{}'.format(args.get('city')),
        'state': '{}'.format(args.get('state'))
    }

    ## connect to DB
    con = psql.connect('host=localhost port=5432 user=postgres password=postgres dbname=mytravel')
    cur = con.cursor()

    ## create query
    qry = """SELECT * FROM places"""
    payload = {
        "type": "FeatureCollection",
        "features": [],
        "crs": {
            "type": "name",
            "properties": {
              "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        }
    }
    if not len(params) == 0:
        qry += r' WHERE'
        for key in params:
            if params[key] != 'None':
                qry += r" {} = ".format(key)
                if type(params[key]) is str:
                    qry += r"'{}' AND".format(params[key])
                else:
                    qry += r"{} AND".format(params[key])
    qry = qry[:-4] +';'
    cur.execute(qry)
    for row in cur.fetchall():
        cargo = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [row[8], row[7]]
            },
            "properties": {
                "id": row[0],
                "name": row[6],
                "type": row[1],
                "address": row[2],
                "city": row[3],
                "state": row[4],
                "zip": row[5]
            }
        }
        payload["features"].append(cargo)
    return json.dumps(payload, indent=2, sort_keys=True)


@app.route('/api/trips/all', methods=["GET"])
def get_trips():
    con = psql.connect('host=localhost port=5432 user=postgres password=postgres dbname=mytravel')
    cur = con.cursor()
    cur.execute('SELECT place, state, type, id FROM trips')
    payload = {}
    for r in cur.fetchall():
        if r[0] in payload:
            payload[r[0]]['type'].append(r[2])
        else:
            payload[r[0]] = {
                "state": r[1],
                "type": [r[2]],
                "id" : r[3]
            }
    return json.dumps(payload)
