import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface CommentAttributes {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'approved' | 'createdAt' | 'updatedAt'> {}

export default function CommentModel(sequelize: Sequelize) {
  return sequelize.define<Model<CommentAttributes, CommentCreationAttributes>>(
    'Comment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      blogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'blog_id',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: 'comments',
      underscored: true,
      timestamps: true,
    }
  );
}
