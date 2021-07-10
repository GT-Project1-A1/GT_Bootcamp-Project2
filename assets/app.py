# Dependencies
from flask import Flask, render_template, redirect, Markup, jsonify
from flask_pymongo import PyMongo
from bson.json_util import dumps
import pymongo
from flask_cors import CORS

app = Flask(__name__)

CORS(app, support_credentials = True)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/election2020"
mongo = PyMongo(app)

# create route that rendrs index.html template
@app.route("/")
def index():
    

    candidate = mongo.db.pCandidate.find()
    state = mongo.db.pState.find()
    county = mongo.db.pCounty.find()

    all_data = [candidate, state, county]

    return_data = []

    for dataset in all_data:

        list_cur = list(dataset)
        print(list_cur)
        json_data = dumps(list_cur)
        return_data.append(json_data)

    return (return_data[0])

# @app.route("localhost:8000/scrape")
# conn = "mongodb://localhost:27017/" 
# client = pymongo.MongClient(conn)

# db = client.election_2020



# PULL IN CSV
# csv_path = "Niraj/president_county_candidate.csv"

# election_df = pd.read_csv(csv_path, encoding="utf-8")
# election_df.head()

if __name__ == "__main__":
    app.run(debug=True)