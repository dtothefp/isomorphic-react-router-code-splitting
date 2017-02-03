import path from 'path';
/**
 * Rename a file path with just it's base name and immediate parent dir
 * @param {String} fp file path
 * @return {String} renamed file path
 *
 * ex. bleep/bloop/bloosh.js => bloop/bloosh
 */
export default function(fp) {
  const dir = path.basename(path.dirname(fp));
  const base = path.basename(fp, path.extname(fp));

  return path.join(dir, base);
}
