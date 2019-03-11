
function macToString(buff) {
  return [...new Array(buff.length)].map((_, i) => Buffer.from([buff[i]]).toString('hex').toUpperCase()).join(':');
}

function readCString(buff) {
  const asciiString = buff.toString('ascii');
  const end = asciiString.indexOf('\u0000');
  return (end === -1) ? asciiString : asciiString.substr(0, end);
}

function ipToNumber(ip) {
  return Buffer.from(ip.split('.').map(octet => parseInt(octet, 10))).readUInt32BE(0);
}

function numberToIp(number) {
  const buff = Buffer.alloc(4);
  buff.writeUInt32BE(number, 0);
  return `${buff.readUInt8(0)}.${buff.readUInt8(1)}.${buff.readUInt8(2)}.${buff.readUInt8(3)}`;
}

function ipRangeToList(from, to) {
  const fromN = ipToNumber(from);
  const toN = ipToNumber(to);

  if (fromN > toN) {
    throw new Error(`${from} is greater than ${to}`);
  }

  const ips = [];
  for (let i = fromN; i <= toN; i++) {
    ips.push(numberToIp(i));
  }
  return ips;
}

module.exports = {
  macToString,
  readCString,
  ipRangeToList
};
