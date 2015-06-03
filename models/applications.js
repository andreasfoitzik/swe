var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var applicationSchema = new Schema ({
    kind: String,
    name: String,
    telefonnummer: String,
    email: String,
    bedarf: String,
    transport: String,
    bearbeitungsdatum: String,
    eingangsdatum: String,
    bearbeiter: String,
    situation: String,
    status: String,
    priority: String
});

module.exports = mongoose.model('application', applicationSchema);