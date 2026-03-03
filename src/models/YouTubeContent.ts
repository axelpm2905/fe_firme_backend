import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface YouTubeContentAttributes {
  id: number;
  title: string;
  description?: string | null;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface YouTubeContentCreationAttributes extends Optional<YouTubeContentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default function YouTubeContentModel(sequelize: Sequelize) {
  return sequelize.define<Model<YouTubeContentAttributes, YouTubeContentCreationAttributes>>(
    'YouTubeContent',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: 'youtube_contents',
      underscored: true,
      timestamps: true,
    }
  );
}
