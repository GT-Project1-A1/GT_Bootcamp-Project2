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
    countyIdsStates = mongo.db.countyIdsStates.find()

    all_data = [candidate, state, county, county_IDs, countyIdsStates]

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
    #counties = pd.DataFrame(columns = ['Name', 'ID'])

    counties = {}
    countyIds_data = return_list[3]
    countyIds_json = json.loads(countyIds_data)

    # Create dictionary with county name keys and id values
    thestate_id = 0
    county_dict = {}
    for element in countyIds_json:    
        
        ids = element.get("id")


        try: 
            if ids % 1000 == 0:
                counties[thestate_id] = county_dict

                county_dict = {}
                thestate_id = str(ids)
            
            else:       
                names = element.get("name")
                county_dict[names] = ids
        except:
            print(ids)
        
    # Clean data

    # Delete "County" from any county names
    county_name_list = candidate_df["county"].tolist()

    new_county_list = []
    for county in county_name_list:

        county_end = county.find(' County')
        parish_end = county.find(' Parish')
        ctytwnship_end = county.find( ' Cty Townships')

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
    candidate_df.insert(7, "state_id", state_id_lst, True) 

    # Calculate Democrat win percentage
    i = 0         # 0 means Trump, 1 means Biden

    percentDemCounties = {}
    x = 1 
    count = 0

    countiesCandidate_df = candidate_df.groupby(["new_county_name","state_id", "candidate" ]).sum()

    for index, row in countiesCandidate_df.iterrows():
        if i == 0:
            count = row["total_votes"]
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
                #county_id_df = counties.loc[(counties["Name"] == county) & (counties["ID"] > state_id),:] 
                #county_id = county_id_df['ID'].values[0]
                
                temp_dict = counties.get(str(state_id))
                #print(temp_dict)
                county_id = temp_dict.get(county)
                
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

    # Data for Bubble Map - candidate and countyid data - convert to json then dataframe
    IdsStates_data = return_list[4]
    IdsStates_json = json.loads(IdsStates_data)
    IdsStates_df = pd.DataFrame.from_records(IdsStates_json)
    cond_cand_df = df[["state", "county", "candidate", "total_votes"]]
    IdsStates_df1 = IdsStates_df[['id','county','state']]

    # Create two separate data sets containing Biden and Trump vote counts at the county level
    B_candidate_df = cond_cand_df.loc[(cond_cand_df["candidate"] == "Joe Biden"),:]
    T_candidate_df = cond_cand_df.loc[(cond_cand_df["candidate"] == "Donald Trump"),:]

    #Remove the word county from candidate data frames - help with merge
    B_candidate_df['county'] = B_candidate_df['county'].str.replace(' County', '')
    T_candidate_df['county'] = T_candidate_df['county'].str.replace(' County', '')

    #dictionary and map function to convert state full names to abbrev - help with merge
    us_state_abbrev = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO',
    'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA',
    'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
    'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
    'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'}
    B_candidate_df['state'] = B_candidate_df['state'].map(us_state_abbrev)
    T_candidate_df['state'] = T_candidate_df['state'].map(us_state_abbrev)

    #Merge candidate and countyid data on state and county - will be used to map total votes to topojsondata
    Bmerge_df = pd.merge(IdsStates_df1, B_candidate_df, on=["county","state"])
    Tmerge_df = pd.merge(IdsStates_df1, T_candidate_df, on=["county","state"])

    # condense to desired format and convert to dictionary key-value pairs
    Bbubbledf = Bmerge_df[["id", "total_votes"]]
    Tbubbledf = Tmerge_df[["id", "total_votes"]]
    B_area_dict = dict(zip(Bbubbledf.id, Bbubbledf.total_votes))
    T_area_dict = dict(zip(Tbubbledf.id, Tbubbledf.total_votes))
    B_area_dict
    finalJson1 = {}
    # update finaljson
    finalJson.update({"Bcountyvotecount": B_area_dict})
    finalJson.update({"Tcountyvotecount": T_area_dict})

    return finalJson

    


@app.route("/getAllRecords/<tableNumber>")
def getAllRecords(tableNumber):
    all_data = getData()
    return dumps(all_data[int(tableNumber)])

# Part of Dashboard
# Query the county's vote information under State
@app.route('/get_state_data/<state_name>', methods=['GET'])
def get_state_data(state_name):
    # Check that if the entered State name is valid 
    states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
    states = set(states)
    if state_name not in states:
        return {}
    # Query the information realted to State from MongoDb 
    candidate = mongo.db.pCandidate.find({"state": state_name})
    state = mongo.db.pState.find_one({"state": state_name})
    county = mongo.db.pCounty.find({"state": state_name})
    # Get total_votes for State 
    total_votes = state["total_votes"]
    # Format County_data
    county_data = {}
    for d in county: # Get state data from pCounty collection
        county_data[d["county"]] = {}
        county_data[d["county"]]["name"] = d["county"].replace("County", "").strip(" ")
        county_data[d["county"]]["current_votes"] = d["current_votes"]
        county_data[d["county"]]["total_votes"] = d["total_votes"]
        county_data[d["county"]]["percent"] = d["percent"]
        county_data[d["county"]]["candidate_data"] = {}
    for d in candidate: # Get candidate data from pCandidate collection
        county_data[d["county"]]["candidate_data"][d["candidate"]] = {}
        county_data[d["county"]]["candidate_data"][d["candidate"]]["candidate"] = d["candidate"]
        county_data[d["county"]]["candidate_data"][d["candidate"]]["party"] = d["party"]
        county_data[d["county"]]["candidate_data"][d["candidate"]]["total_votes"] = d["total_votes"]
        county_data[d["county"]]["candidate_data"][d["candidate"]]["won"] = d["won"]
    # Return results
    return jsonify({
        "state_name" : state_name,
        "total_votes" : total_votes,
        "county_data" : county_data
    })

# Query state's data  
@app.route('/get_state_data', methods=['GET'])
def get_states():
    # Query candidate's data from MongoDb
    candidate = mongo.db.pCandidate.find()
    # Format state's data
    state_data = {}
    for d in candidate:
        state = d["state"]
        candidate = d["candidate"]
        total_votes = d["total_votes"]
        if state not in state_data.keys():
            state_data[state] = {}
        if candidate not in state_data[state].keys():
            state_data[state][candidate] = 0
        state_data[state][candidate] += total_votes
    # Return state_data
    return state_data


if __name__ == "__main__":
    app.run(debug=True)
