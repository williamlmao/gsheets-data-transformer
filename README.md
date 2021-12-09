# Overview

Google Sheets Data Transformer is apps script allows you to build a set of rules you can use to clean, relabel, recategorize, and/or modify your data.

A few use cases:

- Relabel/recategorize data, such as transactions in your credit card statement
- Adjusting outliers, like bringing down your workout time back down to the average for a day you forgot to turn your watch tracking off
- Normalize wonky data, when you have inconsistent manual data entry

This was originally built so that I could write rules to easily relabel my credit card transaction types and categories, but I've written it to be very general so you should be able to use it for whatever you like.

# Set up

1. Make a copy of [this sheet](https://docs.google.com/spreadsheets/d/1exUF-Sya992lcHp98JoRRGb7Lxc_B4xLyprpzyJWzNE).
   ![Menu](/readmeImages/menu.png "Menu")
2. Open the "Data Transformer" menu (should be to the left of "Last edit was made x minutes ago"). Click "Set up".
3. Accept the permissions. It will tell you this code is unsafe. You'll need to accept it anyways (you can indenpendently audit this code to make sure its safe).
   ![Menu](/readmeImages/menu.png "Menu")
4. That's it for set up! See usage steps below.

# Usage

1. Paste your dataset into the "Data" tab. Headers are mandatory and must be in row 1.
2. Write your rules in the "Rules" tab. The algorithm will give rules at the top of the list lower priority than rules at the bottom.
3. Open the "Data Transformer" menu (should be to the left of "Last edit was made x minutes ago"). Click "Transform Data".

# Limitations

- There are only 3 fields you can use to determine each rule. Support for more fields is possible, but 3 seemed like enough.
- You cannot mix AND and OR logic in a single rule. You would not be able to write a rule like "Name equals Bill AND (Age < 0 OR Age >30)". I'd like to update this tool to support this, but the main issue I was running into when thinking it through was how the entry might look in the Rules tab. Please let me know if you have any suggestions here!
