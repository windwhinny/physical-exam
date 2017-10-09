import path = require('path');
import config = require('config');
import fs = require('mz/fs');
const root = config.get('root') as string;

async function rmrf(filepath: string, valid: (path: string) => boolean) {
  if (!await fs.exists(filepath)) return;
  const state = await fs.stat(filepath);
  if (state.isFile()) {
    if (valid && !valid(filepath)) {
      return;
    }
    return await fs.unlink(filepath);
  } else if (state.isDirectory()) {
    const files = await fs.readdir(filepath);
    await Promise.all(files.map(file => {
      return rmrf(path.join(filepath, file), valid);
    }));
    return;
  }
  throw new Error(`unknow file type: ${filepath}`);
}


rmrf(path.join(root, 'src'), filename => {
  return !!filename.match(/(.js|.js.map)$/);
});

