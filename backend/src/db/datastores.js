import Datastore from 'nedb-promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function createStore(filename) {
  return Datastore.create({
    filename: path.join(dataDir, filename),
    autoload: true,
    timestampData: true,
  });
}

export const usersStore = createStore('users.db');
export const postsStore = createStore('posts.db');
export const commentsStore = createStore('comments.db');

