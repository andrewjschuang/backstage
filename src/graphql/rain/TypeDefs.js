const TypeDefs = [`
 
  type Hour {
    #Attribute Value
    hourPartial: String
    #Attributes Timestamp
    timestamp: String
    #Attributes Rain Accumulated
    hourAccumulated: String
  }
    
    type Day {
    #Attributes Timestamp
    timestamp: String
    #Rain Accumulated Total
    dayAccumulated: String
    #Rain Accumulated Per Day
    dayPartial: String
  }
    
  type Weather {
    #Device ID
    deviceId: String,
    #Attribute Name
    name: String
    #Accumulated rain per hour
    perHour: [Hour]
    #Accumulated rain per day
    perDay: [Day]
  }
`];

module.exports = TypeDefs;
