import fs from 'fs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export async function parseCSV(input) {
  return new Promise((resolve, reject) => {
    const results = [];
    let stream;

    if (typeof input === 'string') {
      if (fs.existsSync(input)) {
        stream = fs.createReadStream(input);
      } else {
        stream = Readable.from([input]);
      }
    } else if (Buffer.isBuffer(input)) {
      stream = Readable.from(input);
    } else {
      return reject(new Error('Invalid CSV input type'));
    }

    stream
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const records = [];
        const seenEmails = new Set();
        let failed = 0;
        let duplicates = 0;

        for (const row of results) {
          const name = (row.name || row.fullname || '').trim();
          const email = (row.email || row.mail || '').trim().toLowerCase();
          const phone = (row.phone || row.mobile || row.phonenumber || '').trim();
          const tags = row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

          if (!name || (!email && !phone)) {
            failed++;
            continue;
          }

          if (email && seenEmails.has(email)) {
            duplicates++;
            continue;
          }

          if (email) seenEmails.add(email);

          records.push({
            name,
            email,
            phone,
            tags,
          });
        }

        resolve({ records, failed, duplicates });
      })
      .on('error', (err) => reject(err));
  });
}
