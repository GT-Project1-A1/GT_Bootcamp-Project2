# Dependencies
from flask import Flask, render_template, redirect, Markup
# from flask_pymongo import PyMongo

# import pymongo

import pandas as pd

# conn = "mongodb://localhost:27017/" 
# client = pymongo.MongClient(conn)

# db = client.election_2020



# PULL IN CSV
csv_path = "Niraj/president_county_candidate.csv"

election_df = pd.read_csv(csv_path, encoding="utf-8")
election_df.head()