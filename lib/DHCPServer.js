const debug = require('debug')('DHCPServer');
const EventEmitter = require('events');
const pcap = require('pcap2');
const dgram = require('dgram');

const DHCPParser = require('./DHCPParser');
const utils = require('./utils');

class DHCPServer extends EventEmitter {
  constructor(config, leases = {}) {
    super();
    this._config = Object.assign({
      interface: 'eth0',
      serverIp: '192.168.0.2',
      serverPort: 67,
      broadcastIp: '255.255.255.255',
      ipRanges: [{ from: '192.168.0.100', to: '192.168.0.200' }],
      ipStatic: {},
      forceReleases: false,
      options: {
        1: '255.255.255.0', // Subnet mask
        3: ['192.168.0.1'], // Router
        6: ['8.8.8.8', '8.8.4.4'], // DNS
        51: 600,
        54: '192.168.0.2' // DHCP Server (us)
      },
      optionsMandatory: [1, 3, 51, 54, 6],
      leasesCleanerInterval: 30000 // Clean leases every 30secs
    }, config);

    // Init leases with date casting to allow multiple formats
    this._leases = Object.keys(leases).reduce((acc, mac) => {
      const lease = leases[mac];
      acc[mac] = { // eslint-disable-line no-param-reassign
        expire: new Date(lease.expire),
        address: lease.address,
        state: lease.state
      };
      return acc;
    }, {});

    // Init ip pools
    this._staticPool = Object.keys(this._config.ipStatic).reduce((spool, chaddr) => {
      spool[chaddr.toUpperCase()] = this._config.ipStatic[chaddr]; // eslint-disable-line no-param-reassign
      return spool;
    }, {});
    this._dynamicPool = [].concat(...this._config.ipRanges.map(r => utils.ipRangeToList(r.from, r.to)));

    this._started = false;
  }

  start() {
    if (this._started) {
      throw new Error('Already started');
    }
    debug('Starting...');
    debug(`\tconfig = ${JSON.stringify(this._config)}`);
    try { // First init socket for answers
      this._socket = dgram.createSocket('udp4');
      this._socket.bind(this._config.serverPort, this._config.serverIp, () => {
        this._socket.setBroadcast(true);
      });
    } catch (e) {
      debug('\tError creating socket');
      debug(`\tError = ${e}`);
      throw new Error(`Impossible create udp socket: ${e}`);
    }

    try { // Then sniff interface for requests
      this._pcapSession = new pcap.Session(this._config.interface, {
        filter: `ip proto \\udp and udp dst port ${this._config.serverPort}`
      });
      this._started = true;
      this._pcapSession.on('packet', this._onPacket.bind(this));
      this._leasesCleanerInterval = setInterval(() => this._cleanLeases(), this._config.leasesCleanerInterval);
    } catch (e) {
      debug('\tError starting pcap');
      debug(`\tError = ${e}`);
      throw new Error(`Impossible to sniff in interface "${this._config.interface}": ${e}`);
    }
  }

  stop() {
    debug('Stopping...');
    if (this._started) {
      this._started = false;
      clearInterval(this._leasesCleanerInterval);
      this._pcapSession.close();
    }
  }

  _onPacket(packet) {
    const decodedPacket = pcap.decode.packet(packet);
    // If not multicast or not for us, not our bussiness
    if (decodedPacket.payload.dhost.unicast && decodedPacket.payload.dhost !== this._config.serverIp) { return; }
    debug('New packet received');
    try {
      const parsedPacket = DHCPParser.parsePacket(decodedPacket.payload.payload.payload.data);
      if (parsedPacket.magicCookie !== 1669485411) { return; } // Not DHCP
      debug(`\tParsed DHCP Packet = ${JSON.stringify(parsedPacket)}`);

      const typeOption = parsedPacket.options.find(o => o.tag === 53);
      if (!typeOption) {
        debug('\tReceived DHCP Packet without Type options');
        return;
      }

      switch (typeOption.parsed.value) { // Lets find msg type
        case 'DHCPDISCOVER':
          this.handleDiscover(parsedPacket);
          break;

        case 'DHCPREQUEST':
          this.handleRequest(parsedPacket);
          break;

        default:
          this.emit('notImplementedMessage', parsedPacket);
          debug('\tNOT IMPLEMENTED MESSAGE');
      }
    } catch (e) {
      debug(`\tError parsing packet = ${e}`);
    }
  }

  _cleanLeases() {
    debug('cleaningLeases');
    const now = new Date(Date.now - 10000); // Allow 10secs of margin
    Object.keys(this._leases).forEach((mac) => {
      if (now > this._leases[mac].expire) {
        debug(`\tDevice: ${mac} has expired, cleaning`);
        this.emit('leaseExpired', mac, this._leases[mac]);
        delete this._leases[mac];
      }
    });
  }

  _selectAddress(chaddr) {
    // If there is a lease for this mac return same address
    if (this._leases[chaddr]) {
      return this._leases[chaddr].address;
    }

    // If there is a static entry return that address
    const staticEntry = this._staticPool[chaddr];
    if (staticEntry && typeof staticEntry === 'function') {
      return staticEntry(chaddr);
    }
    if (staticEntry) {
      return staticEntry;
    }

    // Take one (rand) if available from dynamic pool
    const leasedAddrs = Object.keys(this._leases).map(l => l.address);
    const dynamicPoolFree = this._dynamicPool.filter(da => leasedAddrs.indexOf(da) === -1);
    if (dynamicPoolFree.length > 0) {
      return dynamicPoolFree[Math.floor(Math.random() * dynamicPoolFree.length)];
    }

    return null;
  }

  handleDiscover(payload) {
    debug('handleDiscover');
    debug(`\txid = ${payload.xid}`);
    debug(`\tsecs = ${payload.secs}`);
    debug(`\tchaddr = ${payload.chaddr}`);
    debug(`\toptions = [${payload.options.map(o => o.tag).join(',')}]`);
    this.emit('discover', payload);

    const address = this._selectAddress(payload.chaddr);
    if (!address) {
      this.emit('noAddressesAvailable');
      debug('\tIMPOSIBLE TO GET AN ADDRESS. Ignoring discover');
      return;
    }
    debug(`\tselected Addr = ${address}`);
    const lease = this._leases[payload.chaddr] || {
      address: this._selectAddress(payload.chaddr),
    };
    lease.state = 'OFFERED';

    this.sendOffer(lease, payload);
  }

  handleRequest(payload) {
    debug('handleRequest');
    debug(`\txid = ${payload.xid}`);
    debug(`\tsecs = ${payload.secs}`);
    debug(`\tchaddr = ${payload.chaddr}`);
    debug(`\toptions = [${payload.options.map(o => o.tag).join(',')}]`);
    this.emit('request', payload);

    const lease = this._leases[payload.chaddr] || {
      address: this._selectAddress(payload.chaddr),
    };
    lease.state = 'BOUND';
    lease.boundAt = new Date();

    this.sendAck(lease, payload);
  }

  sendOffer(lease, discover) {
    debug('sendOffer');
    const answer = {
      op: 2,
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: discover.xid,
      secs: 0,
      flags: discover.flags,
      ciaddr: '0.0.0.0',
      yiaddr: lease.address,
      siaddr: this._config.options['54'],
      giaddr: discover.giaddr,
      chaddr: discover.chaddr,
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: this._genOptions((discover.options.find(o => o.tag === 55) || { parsed: { value: [] } }).parsed.value,
        discover.chaddr)
    };
    answer.options.push({ tag: 53, parsed: { value: 'DHCPOFFER' } });
    // eslint-disable-next-line no-param-reassign
    lease.expire = new Date(Date.now() + (answer.options.find(o => o.tag === 51).parsed.value * 1000));
    this.emit('leaseChanged', discover.chaddr, lease);

    debug(`\txid = ${answer.xid}`);
    debug(`\tflags = ${answer.flags}`);
    debug(`\tciaddr = ${answer.ciaddr}`);
    debug(`\tyiaddr = ${answer.yiaddr}`);
    debug(`\tgiaddr = ${answer.giaddr}`);
    debug(`\tchaddr = ${answer.chaddr}`);
    debug(`\toptions = ${answer.options.map(o => o.tag).join(', ')}`);

    this.emit('offer', answer);
    this._sendPacket(this._config.broadcastIp, DHCPParser.serializePacket(answer));
  }

  sendAck(lease, request) {
    debug('sendAck');
    const answer = {
      op: 2,
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: request.xid,
      secs: 0,
      flags: request.flags,
      ciaddr: '0.0.0.0',
      yiaddr: lease.address,
      siaddr: this._config.options['54'],
      giaddr: request.giaddr,
      chaddr: request.chaddr,
      sname: '',
      file: '',
      magicCookie: 1669485411,
      options: this._genOptions((request.options.find(o => o.tag === 55) || { parsed: { value: [] } }).parsed.value,
        request.chaddr)
    };
    answer.options.push({ tag: 53, parsed: { value: 'DHCPACK' } });
    // eslint-disable-next-line no-param-reassign
    lease.expire = new Date(Date.now() + (answer.options.find(o => o.tag === 51).parsed.value * 1000));
    this.emit('leaseChanged', request.chaddr, lease);

    debug(`\txid = ${answer.xid}`);
    debug(`\tflags = ${answer.flags}`);
    debug(`\tciaddr = ${answer.ciaddr}`);
    debug(`\tyiaddr = ${answer.yiaddr}`);
    debug(`\tgiaddr = ${answer.giaddr}`);
    debug(`\tchaddr = ${answer.chaddr}`);
    debug(`\toptions = ${answer.options.map(o => o.tag).join(', ')}`);

    this.emit('ack', answer);
    this._sendPacket(this._config.broadcastIp, DHCPParser.serializePacket(answer));
  }

  _genOptions(reqOptions, chaddr) {
    debug('_genOptions');
    debug(`\treqOptions = ${reqOptions}`);
    const options = [...new Set(reqOptions.concat(this._config.optionsMandatory))];
    debug(`\toptions = ${options}`);
    debug(`\tchaddr = ${chaddr}`);

    const result = [];
    options.forEach((tag) => {
      let optionValue = this._config.options[tag];
      if (!optionValue) {
        debug(`\t\toption ${tag} Not defined. Ignoring`);
        return;
      }
      if (typeof optionValue === 'function') {
        debug(`\t\toption ${tag} is a function. Resolving`);
        optionValue = optionValue(chaddr);
      }
      if (Buffer.isBuffer(optionValue)) {
        debug(`\t\toption ${tag} raw = ${optionValue.toString('hex')}`);
        result.push({ tag, raw: optionValue });
      } else {
        debug(`\t\toption ${tag} parsed = ${optionValue}`);
        result.push({ tag, parsed: { value: optionValue } });
      }
    });

    return result;
  }

  _sendPacket(addr, data) {
    debug('_sendPacket');
    this._socket.send(data, 68, addr, (err, bytes) => {
      if (err) {
        debug(`\terror = ${err}`);
        this.emit('error', err);
        return;
      }
      debug(`\tsent = ${bytes}`);
    });
  }
}

module.exports = DHCPServer;
