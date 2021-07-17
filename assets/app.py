# Dependencies
from flask import Flask, render_template, redirect, Markup, jsonify
from flask_pymongo import PyMongo
from bson.json_util import dumps
import pymongo
from flask_cors import CORS
import pandas as pd
import json

app = Flask(__name__)

CORS(app, support_credentials=True)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/election2020"
mongo = PyMongo(app)

# Code to get all data from the database


def getData():
    # Pull data from Mongo
    candidate = mongo.db.pCandidate.find()
    state = mongo.db.pState.find()
    county = mongo.db.pCounty.find()

    all_data = [candidate, state, county]

    return all_data

# create route that rendrs index.html template


@app.route("/")
def index():

    # Create dictionary to for topojson state ids
    state_ids = {"Alabama": "01",
                 "Alaska": "02",
                 "Arizona": "04",
                 "Arkansas": "05",
                 "California": "06",
                 "Colorado": "08",
                 "Connecticut": "09",
                 "Delaware": "10",
                 "District of Columbia": "11",
                 "Florida": "12",
                 "Georgia": "13",
                 "Hawaii": "15",
                 "Idaho": "16",
                 "Illinois": "17",
                 "Indiana": "18",
                 "Iowa": "19",
                 "Kansas": "20",
                 "Kentucky": "21",
                 "Louisiana": "22",
                 "Maine": "23",
                 "Maryland": "24",
                 "Massachusetts": "25",
                 "Michigan": "26",
                 "Minnesota": "27",
                 "Mississippi": "28",
                 "Missouri": "29",
                 "Montana": "30",
                 "Nebraska": "31",
                 "Nevada": "32",
                 "New Hampshire": "33",
                 "New Jersey": "34",
                 "New Mexico": "35",
                 "New York": "36",
                 "North Carolina": "37",
                 "North Dakota": "38",
                 "Ohio": "39",
                 "Oklahoma": "40",
                 "Oregon": "41",
                 "Pennsylvania": "42",
                 "Rhode Island": "44",
                 "South Carolina": "45",
                 "South Dakota": "46",
                 "Tennessee": "47",
                 "Texas": "48",
                 "Utah": "49",
                 "Vermont": "50",
                 "Virginia": "51",
                 "Washington": "53",
                 "West Virginia": "54",
                 "Wisconsin": "55",
                 "Wyoming": "56"}

    all_data = getData()

    return_list = []

    for dataset in all_data:

        list_cur = list(dataset)
        json_data = dumps(list_cur)
        return_list.append(json_data)

    # Pull only candidate data
    candidate_data = return_list[0]

    # Convert string of json to a json file
    candidate_json = json.loads(candidate_data)

    # Convert json file to data frame
    df = pd.DataFrame.from_records(candidate_json)

    # Filter data by our two candidates (Biden and Trump)
    candidate_df = df.loc[(df["candidate"] == "Joe Biden") | (
        df["candidate"] == "Donald Trump"), :]

    # Group data by states
    condensed_df = candidate_df.groupby(["state", "candidate"]).sum()

    # Calculate Democrat win percentage
    i = 0         # 0 means Trump, 1 means Biden
    count = 0
    finalJson = {}
<<<<<<< HEAD
    percentDem = {}
    counties = {}
    x = 1 
       
=======
    percentDem = []
    x = 1

>>>>>>> c57cc19e20a2d7c8744ad67bb2ef5da2eb6c0051
    for index, row in condensed_df.iterrows():
        if i == 0:
            count = count + row["total_votes"]
            i = i + 1
        else:
            count = count + row["total_votes"]
            percent = row["total_votes"] / count
            state = row.name[0]
            state_id = state_ids.get(state)

            state_info = {state_id: percent}

            percentDem.update(state_info)

            i = 0
            count = 0
            x = x + 1

    countyIds_data = return_list[2]
    countyIds_json = json.loads(countyIds_data)

<<<<<<< HEAD
    for element in countyIds_json:
        ids = element.get("id")
        names = element.get("name")
        
        counties.update({ids:names})




    
    finalJson.update({"percentDem": percentDem})
    finalJson.update({"countyIDs": counties})
    
=======
    finalJson.update({"percentDem": percentDem})
    finalJson.update({"countyIDs": countyIds_json})

>>>>>>> c57cc19e20a2d7c8744ad67bb2ef5da2eb6c0051
    return finalJson


@app.route("/getAllRecords/<tableNumber>")
def getAllRecords(tableNumber):
    all_data = getData()
    return dumps(all_data[int(tableNumber)])


if __name__ == "__main__":
    app.run(debug=True)
