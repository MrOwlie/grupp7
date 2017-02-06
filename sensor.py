import random
import uuid
import time
import datetime
import requests

URL = '' #Enter URL here
class sensor:

    sensorType=""
    sensorId=""
    rightBound=""
    leftBound=""

    def __init__(self,id):
        self.sensorId = id;
        self.rightBound=-25; #value to limit first generation of data
        self.leftBound=25;
        self.latestValue=random.uniform(self.leftBound,self.rightBound);

    def randomdata(self): #calculate a random temp value
        if(self.latestValue >0):
            self.rightBound=self.latestValue-5
            self.leftBound=self.latestValue+5
        else:
            self.rightBound=self.latestValue+5
            self.leftBound=self.latestValue-5


        self.latestValue=int( random.uniform(self.leftBound,self.rightBound))
        return self.sensorId,self.latestValue

def monthdata(month,sensorid):


    n = month
    k=1
    x=sensor(sensorid)

    while( n < month+1):
        XD="2017-"+str(n)+"-"+str(k)+" 15:00"
        if(k >= 31):
            n=n+1
            k =1
        k = k + 1

        monthdata = {'date':XD ,'Sensordata' : str(x.randomdata())}
        r = requests.post(URL, data = monthdata )

def sensordata(sensorid):

    x=sensor(sensorid)
    ts = time.time()
    TS = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M')
    sensordata = { 'date' : TS, 'Sensordata' : str(x.randomdata())}
    r = requests.post(URL,data = sensordata)

def randomID():
    randomID = uuid.uuid4()
    randomID= str(randomID)
    return randomID

if __name__ == "__main__":
    monthdata("feb", randomID())
