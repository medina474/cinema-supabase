\copy votes(userid, filmid, note, timestamp) from '../data/k/ratings_small.csv' (format csv, header, encoding 'utf8');
