const TypeDefs = [`
 
  type AttrValues {
    #Attribute Value
    value: Float
    #Attributes Timestamp
    ts: String
    #Attributes Label
    attr: String
  }
    
  type Device {
    #Device ID
    id: String,
    #Air Temperature - Average
    atAvg: [AttrValues]
    #Rain Volume
    pcVol: [AttrValues]
    #Wind Speed - Max
    wsMx: [AttrValues]
    #Relative Humidity - Average
    rhAvg: [AttrValues]
  }
`];

module.exports = TypeDefs;
