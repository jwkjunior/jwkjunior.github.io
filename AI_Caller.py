import sys
import json


#The 3 lines below may not be needed - depends on how the re-install works (they are commented out for now)
sys.path
sys.path.append('C:/inetpub/wwwroot/DQD_Web_AI/Py311_venv/Lib/site-packages')
sys.path.append('C:/inetpub/wwwroot/DQD_Web_AI/Py311_venv')


from utils import llama32
from utils import llama31
 
from together import Together

testnumber = 0

entries = json.loads(sys.argv[1])  # Converts the string representation of a list (e.g. '["1", "5"]') to a Python list
                                   # sys.argv[1] is the argument provided to Python by the Node.js script.

#entries = ["12", "120", "1"]       # Uncomment this line for testing by running this file only (this mimics entries on DQD Page1)
                                    # Have this or the one above commented out 

entriesAsIntegers = [int(num) for num in entries]   # Converts the string representation of a number to an actual number

entriesAsJSON = json.dumps(entries) 

'''
                                         # This writes to a file - this is useful for debugging any Python script
with open("DQD.txt", "w") as file:       # related issues because the print option does not print to the console
    # Write the content to the file      # window where the SaveToDB_and_Use_AI.js is running (even though 
    #file.write(entriesAsJSON)           # AI_Caller.py is launched by the node.js file in that window - it appears     
                                         # that Python and Node can't print to the same window, more research is needed  
                                         # for why). Note that file.write only works if object written to the files is a JSON
 

'''


#numbers = [int(user_entries[0]) , int(user_entries[1]) , int(user_entries[2])]

if (entriesAsIntegers[2] == 1):
                     messages = [
                           {"role": "user",
                            "content": f"Distribute {entriesAsIntegers[1]} items across {entriesAsIntegers[0]} months using a flat line so that each month has either approximately or exactly the same number of items as all other months. All deliveries must be whole numbers and the total needs to add to {entriesAsIntegers[1]}. Do not include any text describing the result, respond with only an array containing the quantity for each month like this example [3, 5, 2]."}
                     ]
                     testnumber = 1

if (entriesAsIntegers[2] == 2):
                     messages = [
                           {"role": "user",
                            "content": f"Distribute {entriesAsIntegers[1]} items across {entriesAsIntegers[0]} months using an ascending line so that each month has the same or more items than the month before it. Try to get the line as close to a 45 degree angle as possible. All monthly quantities must be positive integers and the total needs to add to {entriesAsIntegers[1]}.  Do not include any text describing the result, respond with only an array containing the quantity for each month like this example [3, 5, 2]."}
                     ]
                     testnumber = 2

 
if (entriesAsIntegers[2] == 3):
                     messages = [
                           {"role": "user",
                            "content": f"Distribute {entriesAsIntegers[1]} items across {entriesAsIntegers[0]} months using a descending line so that each month has the same or fewer items than the month before it. Try to get the line as close to a 45 degree angle as possible. All monthly quantities must be positive integers and the total needs to add to {entriesAsIntegers[1]}.  Do not include any text describing the result, respond with only an array containing the quantity for each month like this example [3, 5, 2]."}
                     ]
                     testnumber = 3

if (entriesAsIntegers[2] == 4):
                     messages = [
                           {"role": "user",
                            "content": f"Distribute {entriesAsIntegers[1]} items across {entriesAsIntegers[0]} months using a bell curve so that the month or months in the middle have the most items and the months on the ends have the fewest items. Try to make the bell curve not too steep or too flat. All monthly quantities must be whole numbers and the total needs to add to {entriesAsIntegers[1]}.  Do not include any text describing the result, respond with only an array containing the quantity for each month like this example [3, 5, 2]."}
                     ]
                     testnumber = 4
'''

messages = [
                           {"role": "user",
                            "content": "What is the sum of 2 + 3?"}    # Use this version of messages to test the API by running this file only
                     ]
'''

response_32 = llama32(messages,90)

'''
with open("DQD.txt", "w") as file:          # related issues because the print option does not print to the console
    # Write the content to the file         # window where the SaveToDB_and_Use_AI.js is running (even though 
    #file.write(numbersAsJSON)              # AI_Caller.py is launched by the node.js file in that window - it appears     
    file.write(json.dumps(response_32))     # that Python and Node can't print to the same window, more research is needed  
                                            # for why).
'''
print(response_32)
