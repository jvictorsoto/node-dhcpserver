const utils = require('./utils');
const { parseOptions, serializeOptions } = require('./OptionsParser');

/** DHCP packet structure
 * 0                   1                   2                   3
 * 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |     op (1)    |   htype (1)   |   hlen (1)    |   hops (1)    |
 * +---------------+---------------+---------------+---------------+
 * |                            xid (4)                            |
 * +-------------------------------+-------------------------------+
 * |           secs (2)            |           flags (2)           |
 * +-------------------------------+-------------------------------+
 * |                          ciaddr  (4)                          |
 * +---------------------------------------------------------------+
 * |                          yiaddr  (4)                          |
 * +---------------------------------------------------------------+
 * |                          siaddr  (4)                          |
 * +---------------------------------------------------------------+
 * |                          giaddr  (4)                          |
 * +---------------------------------------------------------------+
 * |                                                               |
 * |                          chaddr  (16)                         |
 * |                                                               |
 * |                                                               |
 * +---------------------------------------------------------------+
 * |                                                               |
 * |                          sname   (64)                         |
 * +---------------------------------------------------------------+
 * |                                                               |
 * |                          file    (128)                        |
 * +---------------------------------------------------------------+
 * |                                                               |
 * |                       options (variable)                      |
 * +---------------------------------------------------------------+
 */

function parsePacket(payload) {
  if (!Buffer.isBuffer(payload) || payload.length < 240) {
    throw new Error('Buffer of at least 240 bytes is required');
  }

  const parsed = {
    op: payload.readUInt8(0),
    htype: payload.readUInt8(1),
    hlen: payload.readUInt8(2),
    hops: payload.readUInt8(3),
    xid: payload.readUInt32BE(4),
    secs: payload.readUInt16BE(8),
    flags: payload.readUInt16BE(10),
    ciaddr: `${payload.readUInt8(12)}.${payload.readUInt8(13)}.${payload.readUInt8(14)}.${payload.readUInt8(15)}`,
    yiaddr: `${payload.readUInt8(16)}.${payload.readUInt8(17)}.${payload.readUInt8(18)}.${payload.readUInt8(19)}`,
    siaddr: `${payload.readUInt8(20)}.${payload.readUInt8(21)}.${payload.readUInt8(22)}.${payload.readUInt8(23)}`,
    giaddr: `${payload.readUInt8(24)}.${payload.readUInt8(25)}.${payload.readUInt8(26)}.${payload.readUInt8(27)}`,
    chaddr: utils.macToString(payload.slice(28, 28 + payload[2])),
    sname: utils.readCString(payload.slice(44, 108)),
    file: utils.readCString(payload.slice(108, 236)),
    magicCookie: payload.readUInt32BE(236),
    options: parseOptions(payload.slice(240))
  };

  return parsed;
}

function serializePacket(payload) {
  // TODO: Check object structure
  const buff = Buffer.alloc(240); // Fixed packet header
  buff.writeUInt8(payload.op, 0);
  buff.writeUInt8(payload.htype, 1);
  buff.writeUInt8(payload.hlen, 2);
  buff.writeUInt8(payload.hops, 3);
  buff.writeUInt32BE(payload.xid, 4);
  buff.writeUInt16BE(payload.secs, 8);
  buff.writeUInt16BE(payload.flags, 10);
  payload.ciaddr.split('.').forEach((n, i) => buff.writeUInt8(n, 12 + i));
  payload.yiaddr.split('.').forEach((n, i) => buff.writeUInt8(n, 16 + i));
  payload.siaddr.split('.').forEach((n, i) => buff.writeUInt8(n, 20 + i));
  payload.giaddr.split('.').forEach((n, i) => buff.writeUInt8(n, 24 + i));
  Buffer.from(payload.chaddr.replace(/:/g, ''), 'hex').forEach((b, i) => buff.writeUInt8(b, 28 + i));
  buff.write(payload.sname, 44, 108, 'ascii');
  buff.write(payload.file, 108, 236, 'ascii');
  buff.writeInt32BE(payload.magicCookie, 236);

  return Buffer.concat([buff, serializeOptions(payload.options || [])]);
}

module.exports = { parsePacket, serializePacket };
