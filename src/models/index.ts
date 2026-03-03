import { Sequelize } from 'sequelize';
import config from '../config/database';
import User from './User';
import Blog from './Blog';
import Comment from './Comment';
import Material from './Material';
import Event from './Event';
import YouTubeContent from './YouTubeContent';

const env = (process.env.NODE_ENV || 'development') as keyof typeof config;
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database!,
  dbConfig.username!,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: dbConfig.logging ?? false,
    pool: dbConfig.pool,
  }
);

const db = {
  sequelize,
  Sequelize,
  User: User(sequelize),
  Blog: Blog(sequelize),
  Comment: Comment(sequelize),
  Material: Material(sequelize),
  Event: Event(sequelize),
  YouTubeContent: YouTubeContent(sequelize),
};

// Associations
db.User.hasMany(db.Blog, { foreignKey: 'authorId' });
db.Blog.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

db.Blog.hasMany(db.Comment, { foreignKey: 'blogId' });
db.Comment.belongsTo(db.Blog, { foreignKey: 'blogId' });
db.User.hasMany(db.Comment, { foreignKey: 'userId' });
db.Comment.belongsTo(db.User, { foreignKey: 'userId' });

export default db;
