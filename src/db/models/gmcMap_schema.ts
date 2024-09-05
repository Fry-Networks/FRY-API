import mongoose from 'mongoose';

const dataRowSchema = new mongoose.Schema({
  date: { type: String, required: true },
  cpm: { type: String },
  acpm: { type: String },
  usv_h: { type: String },
  latitude: { type: String },
  longitude: { type: String },
});

const metadataSchema = new mongoose.Schema({
    data_type: { type: String, required: true },
  }, { _id: false });

const GmcMapSchema = new mongoose.Schema({
  paramID: { type: String, required: true },
  minerKey: { type: String, required: true },
  data: [dataRowSchema],
  metadata: metadataSchema,
}, { timestamps: true });

export const GmcMapData = mongoose.model('GmcMap', GmcMapSchema);
