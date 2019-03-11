const DHCPServer = require('./index');

const myDHCPServer = new DHCPServer({
  interface: 'eth0',
  serverIp: '192.168.0.2',
  serverPort: 67,
  broadcastIp: '10.32.2.31',
  ipRanges: [{ from: '192.168.0.10', to: '192.168.0.200' }],
  ipStatic: {},
  forceReleases: false,
  options: {
    1: '255.255.255.0', // Subnet mask
    3: ['192.168.0.1'], // Router
    6: ['8.8.8.8', '8.8.4.4'], // DNS
    15: 'mydomain', // Domain name
    51: 600, // Lease time
    54: '192.168.0.2', // DHCP Server (us)
  },
  leasesCleanerInterval: 30000 // Clean leases every 30secs
});

myDHCPServer.start();
