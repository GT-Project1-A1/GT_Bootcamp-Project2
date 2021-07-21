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
    county_IDs = mongo.db.countyIds.find()

    all_data = [candidate, state, county, county_IDs]

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
        json_data = dumps(list_cur, ensure_ascii=False).encode('utf8')
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
    percentDemStates = {}
    x = 1

    for index, row in condensed_df.iterrows():
        if i == 0:
            count = count + row["total_votes"]
            i = i + 1
        else:
            count = count + row["total_votes"]
            percent = row["total_votes"] / count
            thestate = row.name[0]
            state_id = state_ids.get(thestate)

            state_info = {state_id: percent}

            percentDemStates.update(state_info)

            i = 0
            count = 0
            x = x + 1

    # County votes calculation

    # Pull in topojson county ID data from mongo
    counties = pd.DataFrame(columns=['Name', 'ID'])
    countyIds_data = return_list[3]
    countyIds_json = json.loads(countyIds_data)

    # Create dictionary with county name keys and id values
    for element in countyIds_json:
        ids = element.get("id")
        names = element.get("name")

        if names == "De Kalb":
            names = "DeKalb"

        counties = counties.append(
            {'Name': names, 'ID': ids}, ignore_index=True)

    # Clean data
    # Delete "County" from any county names
    county_name_list = candidate_df["county"].tolist()

    new_county_list = []
    for county in county_name_list:

        county_end = county.find(' County')
        parish_end = county.find(' Parish')
        ctytwnship_end = county.find(' Cty Townships')

        if county_end > 0:
            updated_county = county[0:county_end]
        elif parish_end > 0:
            updated_county = county[0:parish_end]
        elif ctytwnship_end > 0:
            updated_county = county[0:ctytwnship_end]
        else:
            updated_county = county

        new_county_list.append(updated_county)

    # Change original county names with new county list
    candidate_df.insert(7, "new_county_name", new_county_list, True)
    
    
    # Append state IDs
    # Define blank state id list
    state_id_lst = []

    # Pull un-edited state column from original dataset
    state_lst = candidate_df["state"]

    # Loop through state_lst and append the state id (taken from the state_ids dict) to a new list (state_id_lst)
    for astate in state_lst:
        the_id = state_ids.get(astate)
        the_id = int(the_id)*1000
        state_id_lst.append(the_id)

    # Add a column to the candidate_df of the corresponding state ids
    candidate_df.insert(8, "state_id", state_id_lst, True)

    # Calculate Democrat win percentage
    i = 0         # 0 means Trump, 1 means Biden
    count = 0
    percentDemCounties = {}
    x = 1 

    
    countiesCandidate_df = candidate_df.groupby(["new_county_name","state_id", "candidate" ]).sum()
    
    for index, row in countiesCandidate_df.iterrows():

        if i == 0:
            count = count + row["total_votes"]
            i = i + 1
        else:
            count = count + row["total_votes"]

            # Two "counties" in the dataset (Cary Plt. and Kingsbury Plt.) have Biden and Trump at 0 votes so go 50% for each
            if count != 0:
                percent = row["total_votes"] / count
            else:
                percent = .5
                
            county = row.name[0]
            state_id = row.name[1]

            try:
                county_id_df = counties.loc[(counties["Name"] == county) & (
                    counties["ID"] > state_id) & (counties["ID"] < state_id + 1000), :]
                county_id = county_id_df['ID'].values[0]

            except:
                county_id = None

            if county_id != None:
                county_info = {county_id: percent}
                percentDemCounties.update(county_info)     

            i = 0
            count = 0
            x = x + 1

    finalJson.update({"percentDemStates": percentDemStates})
    finalJson.update({"percentDemCounties": percentDemCounties})

    return finalJson


@app.route("/getAllRecords/<tableNumber>")
def getAllRecords(tableNumber):
    all_data = getData()
    return dumps(all_data[int(tableNumber)])


if __name__ == "__main__":
    app.run(debug=True)
