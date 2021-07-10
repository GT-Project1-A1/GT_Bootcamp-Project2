# Dependencies
from flask import Flask, render_template, redirect, Markup
from flask_pymongo import PyMongo
import pymongo

app = Flask(__name__)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/election2020"
mongo = PyMongo(app)

# create route that rendrs index.html template
@app.route("/")
def index():
    myclient = pymongo.MongoClient("mongodb:localhost:27017/")
    mydb = myclient["election2020"]
    mycol = mydb["president_county_candidate"]

    county = mycol.find({"county",""},{ "county": 1})

    return render_template("index.html", county=county)


# conn = "mongodb://localhost:27017/" 
# client = pymongo.MongClient(conn)

# db = client.election_2020



# PULL IN CSV
# csv_path = "Niraj/president_county_candidate.csv"

# election_df = pd.read_csv(csv_path, encoding="utf-8")
# election_df.head()