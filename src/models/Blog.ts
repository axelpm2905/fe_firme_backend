import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface BlogAttributes {
  id: number;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string | null;
  category: string;
  authorId: number;
  commentsEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogCreationAttributes extends Optional<BlogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default function BlogModel(sequelize: Sequelize) {
  return sequelize.define<Model<BlogAttributes, BlogCreationAttributes>>(
    'Blog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      featuredImage: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        field: 'featured_image',
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'author_id',
      },
      commentsEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'comments_enabled',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      tableName: 'blogs',
      underscored: true,
      timestamps: true,
    }
  );
}
