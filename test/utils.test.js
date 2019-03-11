const { expect } = require('chai');

const { ipRangeToList } = require('../lib/utils');

describe('IP Ranges', () => {
  it('can generate a list of ips from a range', (done) => {
    expect(ipRangeToList('192.168.0.1', '192.168.0.1')).to.deep.equal(['192.168.0.1']);
    expect(ipRangeToList('192.168.0.1', '192.168.0.3')).to.deep.equal(['192.168.0.1', '192.168.0.2', '192.168.0.3']);

    // 192.168.0.1 - 192.168.0.100 = 100 ips
    expect(ipRangeToList('192.168.0.1', '192.168.0.100'))
      .to.deep.equal([...Array(100)].map((_, i) => `192.168.0.${i + 1}`));

    // 192.168.0.1 - 192.168.0.255 & 192.168.1.0 - 192.168.1.100 = 255 + 101 ips
    expect(ipRangeToList('192.168.0.1', '192.168.1.100'))
      .to.deep.equal([...Array(255)].map((_, i) => `192.168.0.${i + 1}`)
        .concat([...Array(101)].map((_, i) => `192.168.1.${i}`)));

    done();
  });
});
