# Overview

![Screenshot of rules](/readmeImages/demo1.png "Demo")

Google Sheets Data Transformer allows you to easily create a set of rules you can use to transform your data.

A few use cases:

- Relabel/recategorize data, such as transactions in your credit card statement
- Tagging outliers. Identifying those days you forgot to stop tracking your workout
- Normalize wonky data, when you have inconsistent manual data entry

This was originally built so that I could write rules to easily relabel my credit card transaction types and categories, but I've written it to be very general so you should be able to use it for whatever you like.

# Set up

1. Make a copy of [this sheet](https://docs.google.com/spreadsheets/d/1exUF-Sya992lcHp98JoRRGb7Lxc_B4xLyprpzyJWzNE).
   ![Menu](/readmeImages/menu.png "Menu")
2. Open the "Data Transformer" menu (should be to the left of "Last edit was made x minutes ago"). Click "Set up".
3. Accept the permissions. It will tell you this code is unsafe. You'll need to accept it anyways (you can indenpendently audit this code to make sure its safe).
   ![Menu](/readmeImages/menu.png "Menu")
4. There's some dummy data from the plaid API in there for you to mess around with. Edit the rules and then give the usage steps below a try.

# Usage

1. Paste your dataset into the "Data" tab. Headers are mandatory and must be in row 1.
2. Write your rules in the "Rules" tab. The algorithm will give rules at the top of the list lower priority than rules at the bottom.
3. Open the "Data Transformer" menu (should be to the left of "Last edit was made x minutes ago"). Click "Transform Data".

# Limitations

- There are only 3 fields you can use to determine each rule. Support for more fields is possible, but 3 seemed like enough.
- You cannot mix AND and OR logic in a single rule. You would not be able to write a rule like "Name equals Bill AND (Age < 0 OR Age >30)". I'd like to update this tool to support this, but the main issue I was running into when thinking it through was how the entry might look in the Rules tab. Please let me know if you have any suggestions here!
- You cannot perform any work (formulas or functions) within the "New Value" columns. The best workaround here is to add a note column and use this tool to add some metadata. You can then use that to filter down your dataset and use a sheet function to update the value.
