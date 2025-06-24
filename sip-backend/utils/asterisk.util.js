import { connection } from '../config/mysql.js';

export const insertSipUser = ({ name, secret }) => {
  if (!name || !secret) {
    console.error('❌ Username and secret are required.');
    return;
  }

  const defaultUser = {
    host: 'dynamic',
    context: 'default',
    type: 'friend',
    disallow: 'all',
    allow: 'opus,ulaw',
    directmedia: 'no',
    avpf: 'yes',
    force_avp: 'yes',
    encryption: 'yes',
    icesupport: 'yes',
    rtcp_mux: 'yes',
    transport: 'ws',
    dtlsenable: 'yes',
    dtlsverify: 'fingerprint',
    dtlssetup: 'actpass',
    dtlscertfile: '/etc/asterisk/keys/asterisk.crt',
    dtlsprivatekey: '/etc/asterisk/keys/asterisk.key',
    qualify: 'yes',
    callbackextension: name,
  };

  const query = `
    INSERT INTO sipusers (
      name, secret, host, context, type, disallow, allow, directmedia,
      avpf, force_avp, encryption, icesupport, rtcp_mux, transport,
      dtlsenable, dtlsverify, dtlssetup, dtlscertfile, dtlsprivatekey,
      qualify, callbackextension
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    secret,
    defaultUser.host,
    defaultUser.context,
    defaultUser.type,
    defaultUser.disallow,
    defaultUser.allow,
    defaultUser.directmedia,
    defaultUser.avpf,
    defaultUser.force_avp,
    defaultUser.encryption,
    defaultUser.icesupport,
    defaultUser.rtcp_mux,
    defaultUser.transport,
    defaultUser.dtlsenable,
    defaultUser.dtlsverify,
    defaultUser.dtlssetup,
    defaultUser.dtlscertfile,
    defaultUser.dtlsprivatekey,
    defaultUser.qualify,
    defaultUser.callbackextension,
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.error(`❌ SIP user "${name}" already exists.`);
      } else {
        console.error('❌ Error inserting SIP user:', error);
      }
      return;
    }

    console.log('✅ Inserted SIP User:', name);
  });
};
