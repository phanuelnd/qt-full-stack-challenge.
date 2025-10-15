const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

// Path to your .proto schema
const protoPath = path.join(__dirname, 'proto/user.proto');

// Path to the exported protobuf file
const pbFile = path.join(__dirname, 'users_export.pb');

protobuf.load(protoPath)
  .then(root => {
    // Lookup the UsersExport message type
    const UsersExport = root.lookupType('userdashboard.UsersExport');

    // Read the binary data
    const data = fs.readFileSync(pbFile);

    // Decode
    const decoded = UsersExport.decode(data);

    // Convert to plain object for easy viewing
    const object = UsersExport.toObject(decoded, {
      longs: String,
      enums: String,
      bytes: String,
      defaults: true,
    });

    console.log(JSON.stringify(object, null, 2));
  })
  .catch(err => {
    console.error('Failed to decode protobuf:', err);
  });