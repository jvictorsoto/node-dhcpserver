const utils = require('./utils');

/** DHCP Options List (soruce: https://www.iana.org/assignments/bootp-dhcp-parameters/bootp-dhcp-parameters.xhtml)
 * +---------+------------------------------------------------------------------+--------------+-----------+
 * |   Tag   |                               Name                               |    Length    |    RFC    |
 * +---------+------------------------------------------------------------------+--------------+-----------+
 * | 0       | Pad                                                              | 0            | [RFC2132] |
 * | 1       | Subnet Mask                                                      | 4            | [RFC2132] |
 * | 2       | Time Offset                                                      | 4            | [RFC2132] |
 * | 3       | Router                                                           | N            | [RFC2132] |
 * | 4       | Time Server                                                      | N            | [RFC2132] |
 * | 5       | Name Server                                                      | N            | [RFC2132] |
 * | 6       | Domain Server                                                    | N            | [RFC2132] |
 * | 7       | Log Server                                                       | N            | [RFC2132] |
 * | 8       | Quotes Server                                                    | N            | [RFC2132] |
 * | 9       | LPR Server                                                       | N            | [RFC2132] |
 * | 10      | Impress Server                                                   | N            | [RFC2132] |
 * | 11      | RLP Server                                                       | N            | [RFC2132] |
 * | 12      | Hostname                                                         | N            | [RFC2132] |
 * | 13      | Boot File Size                                                   | 2            | [RFC2132] |
 * | 14      | Merit Dump File                                                  | N            | [RFC2132] |
 * | 15      | Domain Name                                                      | N            | [RFC2132] |
 * | 16      | Swap Server                                                      | N            | [RFC2132] |
 * | 17      | Root Path                                                        | N            | [RFC2132] |
 * | 18      | Extension File                                                   | N            | [RFC2132] |
 * | 19      | Forward On/Off                                                   | 1            | [RFC2132] |
 * | 20      | SrcRte On/Off                                                    | 1            | [RFC2132] |
 * | 21      | Policy Filter                                                    | N            | [RFC2132] |
 * | 22      | Max DG Assembly                                                  | 2            | [RFC2132] |
 * | 23      | Default IP TTL                                                   | 1            | [RFC2132] |
 * | 24      | MTU Timeout                                                      | 4            | [RFC2132] |
 * | 25      | MTU Plateau                                                      | N            | [RFC2132] |
 * | 26      | MTU Interface                                                    | 2            | [RFC2132] |
 * | 27      | MTU Subnet                                                       | 1            | [RFC2132] |
 * | 28      | Broadcast Address                                                | 4            | [RFC2132] |
 * | 29      | Mask Discovery                                                   | 1            | [RFC2132] |
 * | 30      | Mask Supplier                                                    | 1            | [RFC2132] |
 * | 31      | Router Discovery                                                 | 1            | [RFC2132] |
 * | 32      | Router Request                                                   | 4            | [RFC2132] |
 * | 33      | Static Route                                                     | N            | [RFC2132] |
 * | 34      | Trailers                                                         | 1            | [RFC2132] |
 * | 35      | ARP Timeout                                                      | 4            | [RFC2132] |
 * | 36      | Ethernet                                                         | 1            | [RFC2132] |
 * | 37      | Default TCP TTL                                                  | 1            | [RFC2132] |
 * | 38      | Keepalive Time                                                   | 4            | [RFC2132] |
 * | 39      | Keepalive Data                                                   | 1            | [RFC2132] |
 * | 40      | NIS Domain                                                       | N            | [RFC2132] |
 * | 41      | NIS Servers                                                      | N            | [RFC2132] |
 * | 42      | NTP Servers                                                      | N            | [RFC2132] |
 * | 43      | Vendor Specific                                                  | N            | [RFC2132] |
 * | 44      | NETBIOS Name Srv                                                 | N            | [RFC2132] |
 * | 45      | NETBIOS Dist Srv                                                 | N            | [RFC2132] |
 * | 46      | NETBIOS Node Type                                                | 1            | [RFC2132] |
 * | 47      | NETBIOS Scope                                                    | N            | [RFC2132] |
 * | 48      | X Window Font                                                    | N            | [RFC2132] |
 * | 49      | X Window Manager                                                 | N            | [RFC2132] |
 * | 50      | Address Request                                                  | 4            | [RFC2132] |
 * | 51      | Address Time                                                     | 4            | [RFC2132] |
 * | 52      | Overload                                                         | 1            | [RFC2132] |
 * | 53      | DHCP Msg Type                                                    | 1            | [RFC2132] |
 * | 54      | DHCP Server Id                                                   | 4            | [RFC2132] |
 * | 55      | Parameter List                                                   | N            | [RFC2132] |
 * | 56      | DHCP Message                                                     | N            | [RFC2132] |
 * | 57      | DHCP Max Msg Size                                                | 2            | [RFC2132] |
 * | 58      | Renewal Time                                                     | 4            | [RFC2132] |
 * | 59      | Rebinding Time                                                   | 4            | [RFC2132] |
 * | 60      | Class Id                                                         | N            | [RFC2132] |
 * | 61      | Client Id                                                        | N            | [RFC2132] |
 * | 62      | NetWare/IP Domain                                                | N            | [RFC2242] |
 * | 63      | NetWare/IP Option                                                | N            | [RFC2242] |
 * | 64      | NIS-Domain-Name                                                  | N            | [RFC2132] |
 * | 65      | NIS-Server-Addr                                                  | N            | [RFC2132] |
 * | 66      | Server-Name                                                      | N            | [RFC2132] |
 * | 67      | Bootfile-Name                                                    | N            | [RFC2132] |
 * | 68      | Home-Agent-Addrs                                                 | N            | [RFC2132] |
 * | 69      | SMTP-Server                                                      | N            | [RFC2132] |
 * | 70      | POP3-Server                                                      | N            | [RFC2132] |
 * | 71      | NNTP-Server                                                      | N            | [RFC2132] |
 * | 72      | WWW-Server                                                       | N            | [RFC2132] |
 * | 73      | Finger-Server                                                    | N            | [RFC2132] |
 * | 74      | IRC-Server                                                       | N            | [RFC2132] |
 * | 75      | StreetTalk-Server                                                | N            | [RFC2132] |
 * | 76      | STDA-Server                                                      | N            | [RFC2132] |
 * | 77      | User-Class                                                       | N            | [RFC3004] |
 * | 78      | Directory Agent                                                  | N            | [RFC2610] |
 * | 79      | Service Scope                                                    | N            | [RFC2610] |
 * | 80      | Rapid Commit                                                     | 0            | [RFC4039] |
 * | 81      | Client FQDN                                                      | N            | [RFC4702] |
 * | 82      | Relay Agent Information                                          | N            | [RFC3046] |
 * | 83      | iSNS                                                             | N            | [RFC4174] |
 * | 84      | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 85      | NDS Servers                                                      | N            | [RFC2241] |
 * | 86      | NDS Tree Name                                                    | N            | [RFC2241] |
 * | 87      | NDS Context                                                      | N            | [RFC2241] |
 * | 88      | BCMCS Controller Domain Name list                                |              | [RFC4280] |
 * | 89      | BCMCS Controller IPv4 address option                             |              | [RFC4280] |
 * | 90      | Authentication                                                   | N            | [RFC3118] |
 * | 91      | client-last-transaction-time option                              |              | [RFC4388] |
 * | 92      | associated-ip option                                             |              | [RFC4388] |
 * | 93      | Client System                                                    | N            | [RFC4578] |
 * | 94      | Client NDI                                                       | N            | [RFC4578] |
 * | 95      | LDAP                                                             | N            | [RFC3679] |
 * | 96      | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 97      | UUID/GUID                                                        | N            | [RFC4578] |
 * | 98      | User-Auth                                                        | N            | [RFC2485] |
 * | 99      | GEOCONF_CIVIC                                                    |              | [RFC4776] |
 * | 100     | PCode                                                            | N            | [RFC4833] |
 * | 101     | TCode                                                            | N            | [RFC4833] |
 * | 102-107 | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 108     | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 109     | OPTION_DHCP4O6_S46_SADDR                                         | 16           |           |
 * | 110     | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 111     | Unassigned                                                       |              | [RFC3679] |
 * | 112     | Netinfo Address                                                  | N            | [RFC3679] |
 * | 113     | Netinfo Tag                                                      | N            | [RFC3679] |
 * | 114     | URL                                                              | N            | [RFC3679] |
 * | 115     | REMOVED/Unassigned                                               |              | [RFC3679] |
 * | 116     | Auto-Config                                                      | N            | [RFC2563] |
 * | 117     | Name Service Search                                              | N            | [RFC2937] |
 * | 118     | Subnet Selection Option                                          | 4            | [RFC3011] |
 * | 119     | Domain Search                                                    | N            | [RFC3397] |
 * | 120     | SIP Servers DHCP Option                                          | N            | [RFC3361] |
 * | 121     | Classless Static Route Option                                    | N            | [RFC3442] |
 * | 122     | CCC                                                              | N            | [RFC3495] |
 * | 123     | GeoConf Option                                                   | 16           | [RFC6225] |
 * | 124     | V-I Vendor Class                                                 |              | [RFC3925] |
 * | 125     | V-I Vendor-Specific Information                                  |              | [RFC3925] |
 * | 126     | Removed/Unassigned                                               |              | [RFC3679] |
 * | 127     | Removed/Unassigned                                               |              | [RFC3679] |
 * | 128     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 128     | Etherboot signature. 6 bytes: E4:45:74:68:00:00                  |              |           |
 * | 128     | DOCSIS "full security" server IP address                         |              |           |
 * | 128     | TFTP Server IP address (for IP Phone software load)              |              |           |
 * | 129     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 129     | Kernel options. Variable length string                           |              |           |
 * | 129     | Call Server IP address                                           |              |           |
 * | 130     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 130     | Ethernet interface. Variable length string.                      |              |           |
 * | 130     | Discrimination string (to identify vendor)                       |              |           |
 * | 131     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 131     | Remote statistics server IP address                              |              |           |
 * | 132     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 132     | IEEE 802.1Q VLAN ID                                              |              |           |
 * | 133     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 133     | IEEE 802.1D/p Layer 2 Priority                                   |              |           |
 * | 134     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 134     | Diffserv Code Point (DSCP) for VoIP signalling and media streams |              |           |
 * | 135     | PXE - undefined (vendor specific)                                |              | [RFC4578] |
 * | 135     | HTTP Proxy for phone-specific applications                       |              |           |
 * | 136     | OPTION_PANA_AGENT                                                |              | [RFC5192] |
 * | 137     | OPTION_V4_LOST                                                   |              | [RFC5223] |
 * | 138     | OPTION_CAPWAP_AC_V4                                              | N            | [RFC5417] |
 * | 139     | OPTION-IPv4_Address-MoS                                          | N            | [RFC5678] |
 * | 140     | OPTION-IPv4_FQDN-MoS                                             | N            | [RFC5678] |
 * | 141     | SIP UA Configuration Service Domains                             | N            | [RFC6011] |
 * | 142     | OPTION-IPv4_Address-ANDSF                                        | N            | [RFC6153] |
 * | 143     | OPTION_V4_SZTP_REDIRECT                                          | N            |           |
 * | 144     | GeoLoc                                                           | 16           | [RFC6225] |
 * | 145     | FORCERENEW_NONCE_CAPABLE                                         | 1            | [RFC6704] |
 * | 146     | RDNSS Selection                                                  | N            | [RFC6731] |
 * | 147-149 | Unassigned                                                       |              | [RFC3942] |
 * | 150     | TFTP server address                                              |              | [RFC5859] |
 * | 150     | Etherboot                                                        |              |           |
 * | 150     | GRUB configuration path name                                     |              |           |
 * | 151     | status-code                                                      | N+1          | [RFC6926] |
 * | 152     | base-time                                                        | 4            | [RFC6926] |
 * | 153     | start-time-of-state                                              | 4            | [RFC6926] |
 * | 154     | query-start-time                                                 | 4            | [RFC6926] |
 * | 155     | query-end-time                                                   | 4            | [RFC6926] |
 * | 156     | dhcp-state                                                       | 1            | [RFC6926] |
 * | 157     | data-source                                                      | 1            | [RFC6926] |
 * | 158     | OPTION_V4_PCP_SERVER                                             | Variable; 5+ | [RFC7291] |
 * | 159     | OPTION_V4_PORTPARAMS                                             | 4            | [RFC7618] |
 * | 160     | DHCP Captive-Portal                                              | N            | [RFC7710] |
 * | 161     | OPTION_MUD_URL_V4                                                | N (variable) |           |
 * | 162-174 | Unassigned                                                       |              | [RFC3942] |
 * | 175     | Etherboot (Tentatively Assigned - 2005-06-23)                    |              |           |
 * | 176     | IP Telephone (Tentatively Assigned - 2005-06-23)                 |              |           |
 * | 177     | Etherboot (Tentatively Assigned - 2005-06-23)                    |              |           |
 * | 177     | PacketCable and CableHome (replaced by 122)                      |              |           |
 * | 178-207 | Unassigned                                                       |              | [RFC3942] |
 * | 208     | PXELINUX Magic                                                   | 4            | [RFC5071] |
 * | 209     | Configuration File                                               | N            | [RFC5071] |
 * | 210     | Path Prefix                                                      | N            | [RFC5071] |
 * | 211     | Reboot Time                                                      | 4            | [RFC5071] |
 * | 212     | OPTION_6RD                                                       | 18 + N       | [RFC5969] |
 * | 213     | OPTION_V4_ACCESS_DOMAIN                                          | N            | [RFC5986] |
 * | 214-219 | Unassigned                                                       |              |           |
 * | 220     | Subnet Allocation Option                                         | N            | [RFC6656] |
 * | 221     | Virtual Subnet Selection (VSS) Option                            |              | [RFC6607] |
 * | 222-223 | Unassigned                                                       |              | [RFC3942] |
 * | 224-254 | Reserved (Private Use)                                           |              |           |
 * | 255     | End                                                              | 0            | [RFC2132] |
 * +---------+------------------------------------------------------------------+--------------+-----------+
*/

// Implemented Options
const optionsMapping = {
  1: 'Subnet Mask',
  3: 'Router',
  4: 'Time Server',
  5: 'Name Server',
  6: 'Domain Server',
  7: 'Log Server',
  8: 'Quotes Server',
  9: 'LPR Server',
  10: 'Impress Server',
  11: 'RLP Server',
  12: 'Hostname',
  15: 'Domain Name',
  50: 'Address Request',
  51: 'Address Time',
  53: 'DHCP Message Type',
  54: 'DHCP Server Id',
  55: 'Parameter List',
  57: 'DHCP Max Msg Size',
  60: 'Class Id',
  61: 'Client Id',
  125: 'V-I Vendor-Specific Information'
};

function parseOptions(buff, options = []) {
  if (buff.length === 0) {
    return options;
  }

  const option = {
    tag: buff.readUInt8(0)
  };
  options.push(option);

  if (option.tag === 0xff) {
    option.parsed = {
      name: 'End'
    };
    return options;
  }

  // Rest of options are length variable.
  const len = buff.readUInt8(1);
  if (optionsMapping[option.tag] !== undefined) {
    option.parsed = {
      name: optionsMapping[option.tag]
    };
  }
  switch (option.tag) {
    case 1: // Subnet Mask
    case 50: // Address Request
    case 54: // DHCP Server Id
      option.parsed.value = `${buff.readUInt8(2)}.${buff.readUInt8(3)}.${buff.readUInt8(4)}.${buff.readUInt8(5)}`;
      break;

    case 3: // Router
    case 4: // Time Server
    case 5: // Name Server
    case 6: // Domain Server
    case 7: // Log Server
    case 8: // Quotes Server
    case 9: // LPR Server
    case 10: // Impress Server
    case 11: // RLP Server
      option.parsed.value = [...new Array(len / 4)].map((_, i) => // eslint-disable-next-line
        `${buff.readUInt8(i + 2)}.${buff.readUInt8(i + 3)}.${buff.readUInt8(i + 4)}.${buff.readUInt8(i + 5)}`);
      break;

    case 12: // Host Name
    case 15: // Domain Name
    case 60: // Vendor Class Identifier
      option.parsed.value = utils.readCString(buff.slice(2, 2 + len));
      break;

    case 51: // DHCP Max Msg Size
      option.parsed.value = buff.readUInt32BE(2);
      break;

    case 53: // DHCP Message Type
      option.parsed.value = {
        1: 'DHCPDISCOVER',
        2: 'DHCPOFFER',
        3: 'DHCPREQUEST',
        4: 'DHCPDECLINE',
        5: 'DHCPACK',
        6: 'DHCPNAK',
        7: 'DHCPRELEASE',
        8: 'DHCPINFORM'
      }[buff.readUInt8(2)];
      break;

    case 55: // Parameter List
      option.parsed.value = [...new Array(len)].map((_, i) => buff.readUInt8(2 + i));
      break;

    case 57: // DHCP Max Msg Size
      option.parsed.value = buff.readUInt16BE(2);
      break;

    case 61: // Client Id
      option.parsed.hardwareType = buff.readUInt8(2);
      if (option.parsed.hardwareType === 1) { // Ethernet Hardware type
        option.parsed.value = utils.macToString(buff.slice(3, 2 + len));
      }
      break;

    default: // If we dont know how to parse it lets offer the raw data
      option.raw = Buffer.from(buff.slice(2, 2 + len)); // Force a new buffer alloc.
  }
  return parseOptions(buff.slice(len + 2), options);
}

function serializeOption(option) {
  if (option.tag === 0xff) { // End option
    return Buffer.from([0xff]);
  }

  // If option has a raw field then serialization is not our bussiness, pass it through
  if (option.raw && Buffer.isBuffer(option.raw)) {
    return Buffer.concat([Buffer.from([option.tag, option.raw.length]), option.raw]);
  }

  // If it has no parsed field or no len ignore it
  if (!option.parsed) {
    return null;
  }

  const buffArray = [];
  buffArray.push(Buffer.from([option.tag]));
  switch (option.tag) {
    case 1: // Subnet Mask
    case 50: // Address Request
    case 54: // DHCP Server Id
      buffArray.push(Buffer.from([4])); // 4 bytes length
      buffArray.push(Buffer.from(option.parsed.value.split('.').map(n => parseInt(n, 10))));
      break;

    case 3: // Router
    case 4: // Time Server
    case 5: // Name Server
    case 6: // Domain Server
    case 7: // Log Server
    case 8: // Quotes Server
    case 9: // LPR Server
    case 10: // Impress Server
    case 11: // RLP Server
      buffArray.push(Buffer.from([option.parsed.value.length * 4])); // 4 bytes each ip
      option.parsed.value.forEach((ip) => {
        buffArray.push(Buffer.from(ip.split('.').map(n => parseInt(n, 10))));
      });
      break;

    case 12: // Host Name
    case 15: // Domain Name
    case 60: // Vendor Class Identifier
      buffArray.push(Buffer.from([option.parsed.value.length]));
      buffArray.push(Buffer.from(option.parsed.value, 'ascii'));
      break;

    case 53: // DHCP Message Type
      buffArray.push(Buffer.from([1]));
      buffArray.push(Buffer.from([
        {
          DHCPDISCOVER: 1,
          DHCPOFFER: 2,
          DHCPREQUEST: 3,
          DHCPDECLINE: 4,
          DHCPACK: 5,
          DHCPNAK: 6,
          DHCPRELEASE: 7,
          DHCPINFORM: 8
        }[option.parsed.value]
      ]));
      break;

    case 51: // Address Time
      buffArray.push(Buffer.from([4]));
      buffArray.push(Buffer.alloc(4));
      buffArray[buffArray.length - 1].writeUInt32BE(option.parsed.value, 0);
      break;

    case 55: // Parameter List
      buffArray.push(Buffer.from([option.parsed.value.length]));
      buffArray.push(Buffer.from(option.parsed.value));
      break;

    case 57: // DHCP Max Msg Size
      buffArray.push(Buffer.from([2]));
      buffArray.push(Buffer.alloc(2));
      buffArray[buffArray.length - 1].writeUInt16BE(option.parsed.value, 0);
      break;

    case 61: // Client Id
      buffArray.push(Buffer.from([7]));
      buffArray.push(Buffer.from([option.parsed.hardwareType]));
      buffArray.push(Buffer.from(option.parsed.value.replace(/:/g, ''), 'hex'));
      break;

    default: // We dont know how to serialize it so lets ignore it
      return null;
  }

  return Buffer.concat(buffArray);
}

function serializeOptions(options) {
  if (options.length === 0) {
    return Buffer.from([]);
  }
  const lastOption = options[options.length - 1];
  if (lastOption.tag !== 0xff) { // Force and endoption at the end
    options.push({ tag: 0xff });
  }
  return Buffer.concat(options.map(option => serializeOption(option)).filter(o => o !== null));
}

module.exports = { parseOptions, serializeOptions };
