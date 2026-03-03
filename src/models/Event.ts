import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface EventAttributes {
  id: number;
  title: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default function EventModel(sequelize: Sequelize) {
  return sequelize.define<Model<EventAttributes, EventCreationAttributes>>(
    'Event',
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'events',
      underscored: true,
      timestamps: true,
    }
  );
}
