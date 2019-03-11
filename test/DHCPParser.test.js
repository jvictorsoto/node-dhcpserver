const { expect } = require('chai');

const { parsePacket, serializePacket } = require('../lib/DHCPParser');

describe('DHCPParser sunny cases', () => {
  it('can parse / serialize a standar DHCP Discover', (done) => {
    const input = Buffer.from('01010600e4f162250000000000000000000000000000000000000000aabbccddeeff00000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '000000000000000000000000000000000000000000000000000000638253633501013d0701aabbccddeeff3902024037070103060c0f1c'
      + '2a3c0c756468637020312e32312e31ff', 'hex');

    const parsed = { // Wireshark output
      op: 1,
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: 3841024549,
      secs: 0,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: '0.0.0.0',
      chaddr: 'AA:BB:CC:DD:EE:FF',
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: [
        {
          parsed: {
            name: 'DHCP Message Type',
            value: 'DHCPDISCOVER'
          },
          tag: 53
        },
        {
          parsed: {
            hardwareType: 1,
            name: 'Client Id',
            value: 'AA:BB:CC:DD:EE:FF'
          },
          tag: 61
        },
        {
          parsed: {
            name: 'DHCP Max Msg Size',
            value: 576
          },
          tag: 57
        },
        {
          parsed: {
            name: 'Parameter List',
            value: [1, 3, 6, 12, 15, 28, 42]
          },
          tag: 55
        },
        {
          parsed: {
            name: 'Class Id',
            value: 'udhcp 1.21.1'
          },
          tag: 60
        },
        {
          parsed: {
            name: 'End'
          },
          tag: 255
        }
      ]
    };

    expect(parsePacket(input)).to.deep.equal(parsed);
    expect(serializePacket(parsed)).to.deep.equal(input);
    done();
  });

  it('can parse / serialize a standar DHCP Offer', (done) => {
    const input = Buffer.from('020106011887c0568a340000000000000a2002140a5f55280a200211aabbccddeeff00000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '0000000000000000000000000000000000000000000000000000006382536335010236040a5f55283304000002580104fffffff003040a'
      + '20021106040a4f39430f086d6963612d737462ff', 'hex');

    const parsed = { // Wireshark output
      op: 2,
      htype: 1,
      hlen: 6,
      hops: 1,
      xid: 411549782,
      secs: 35380,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '10.32.2.20',
      siaddr: '10.95.85.40',
      giaddr: '10.32.2.17',
      chaddr: 'AA:BB:CC:DD:EE:FF',
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: [
        {
          parsed: {
            name: 'DHCP Message Type',
            value: 'DHCPOFFER'
          },
          tag: 53
        },
        {
          parsed: {
            name: 'DHCP Server Id',
            value: '10.95.85.40'
          },
          tag: 54
        },
        {
          parsed: {
            name: 'Address Time',
            value: 600
          },
          tag: 51
        },
        {
          parsed: {
            name: 'Subnet Mask',
            value: '255.255.255.240'
          },
          tag: 1
        },
        {
          parsed: {
            name: 'Router',
            value: ['10.32.2.17']
          },
          tag: 3
        },
        {
          parsed: {
            name: 'Domain Server',
            value: ['10.79.57.67']
          },
          tag: 6
        },
        {
          parsed: {
            name: 'Domain Name',
            value: 'mica-stb'
          },
          tag: 15
        },
        {
          parsed: {
            name: 'End'
          },
          tag: 255
        }
      ]
    };

    expect(parsePacket(input)).to.deep.equal(parsed);
    expect(serializePacket(parsed)).to.deep.equal(input);
    done();
  });

  it('can parse / serialize a standar DHCP Request', (done) => {
    const input = Buffer.from('010106001887c0568a34000000000000000000000000000000000000aabbccddeeff00000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '000000000000000000000000000000000000000000000000000000638253633501033d0701aabbccddeeff32040a20021436040a5f5528'
      + '3902024037070103060c0f1c2a3c0c756468637020312e32312e31ff', 'hex');

    const parsed = { // Wireshark output
      op: 1,
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: 411549782,
      secs: 35380,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: '0.0.0.0',
      chaddr: 'AA:BB:CC:DD:EE:FF',
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: [
        {
          tag: 53,
          parsed: {
            name: 'DHCP Message Type',
            value: 'DHCPREQUEST'
          }
        },
        {
          tag: 61,
          parsed: {
            name: 'Client Id',
            hardwareType: 1,
            value: 'AA:BB:CC:DD:EE:FF'
          }
        },
        {
          tag: 50,
          parsed: {
            name: 'Address Request',
            value: '10.32.2.20'
          }
        },
        {
          tag: 54,
          parsed: {
            name: 'DHCP Server Id',
            value: '10.95.85.40'
          }
        },
        {
          tag: 57,
          parsed: {
            name: 'DHCP Max Msg Size',
            value: 576
          }
        },
        {
          tag: 55,
          parsed: {
            name: 'Parameter List',
            value: [1, 3, 6, 12, 15, 28, 42]
          }
        },
        {
          tag: 60,
          parsed: {
            name: 'Class Id',
            value: 'udhcp 1.21.1'
          }
        },
        {
          tag: 255,
          parsed: {
            name: 'End'
          }
        }
      ]
    };

    expect(parsePacket(input)).to.deep.equal(parsed);
    expect(serializePacket(parsed)).to.deep.equal(input);
    done();
  });

  it('can parse / serialize a standar DHCP ACK', (done) => {
    const input = Buffer.from('020106011887c0568a340000000000000a2002140a5f55280a200211aabbccddeeff00000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      + '0000000000000000000000000000000000000000000000000000006382536335010536040a5f55283304000002580104fffffff003040a'
      + '20021106040a4f39430f086d6963612d737462ff', 'hex');

    const parsed = { // Wireshark output
      op: 2,
      htype: 1,
      hlen: 6,
      hops: 1,
      xid: 411549782,
      secs: 35380,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '10.32.2.20',
      siaddr: '10.95.85.40',
      giaddr: '10.32.2.17',
      chaddr: 'AA:BB:CC:DD:EE:FF',
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: [
        {
          tag: 53,
          parsed: {
            name: 'DHCP Message Type',
            value: 'DHCPACK'
          }
        },
        {
          tag: 54,
          parsed: {
            name: 'DHCP Server Id',
            value: '10.95.85.40'
          }
        },
        {
          tag: 51,
          parsed: {
            name: 'Address Time',
            value: 600
          }
        },
        {
          tag: 1,
          parsed: {
            name: 'Subnet Mask',
            value: '255.255.255.240'
          }
        },
        {
          tag: 3,
          parsed: {
            name: 'Router',
            value: [
              '10.32.2.17'
            ]
          }
        },
        {
          tag: 6,
          parsed: {
            name: 'Domain Server',
            value: [
              '10.79.57.67'
            ]
          }
        },
        {
          tag: 15,
          parsed: {
            name: 'Domain Name',
            value: 'mica-stb'
          }
        },
        {
          tag: 255,
          parsed: {
            name: 'End'
          }
        }
      ]
    };

    expect(parsePacket(input)).to.deep.equal(parsed);
    expect(serializePacket(parsed)).to.deep.equal(input);
    done();
  });
});
