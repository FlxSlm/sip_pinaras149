const fs = require('fs');
const crypto = require('crypto');

const content = fs.readFileSync('prisma/migrations/20261006000000_v2_roles_complaint_content/migration.sql', 'utf8');
const normalized = content.replace(/\r\n/g, '\n');
const checksum = crypto.createHash('sha256').update(normalized).digest('hex');
console.log('Current file checksum:', checksum);
