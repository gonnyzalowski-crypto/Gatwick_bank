const fs = require('fs');
let content = fs.readFileSync('src/routes/admin.js', 'utf8');
content = content.replace(
  /userId: user\.id,\n        action: 'ADMIN_BULK_TRANSACTIONS_CREATED'/g,
  user: { connect: { id: user.id } },
          action: 'ADMIN_BULK_TRANSACTIONS_CREATED'
);
fs.writeFileSync('src/routes/admin.js', content);
console.log('Fixed bulk create audit log');
