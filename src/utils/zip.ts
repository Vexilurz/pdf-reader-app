import fs from 'fs';
import archiver from 'archiver';
import unzipper from 'unzipper';

export const zipDirectory = (source, out) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

export const unzipFile = (archive, path) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(archive);
    stream.on('error', reject);
    const unzipExtractor = unzipper.Extract({ path });
    unzipExtractor.on('close', resolve);
    unzipExtractor.on('error', reject);
    stream.pipe(unzipExtractor);
  });
};
