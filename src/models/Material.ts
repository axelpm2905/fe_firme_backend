import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface MaterialAttributes {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  pdfUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaterialCreationAttributes extends Optional<MaterialAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default function MaterialModel(sequelize: Sequelize) {
  return sequelize.define<Model<MaterialAttributes, MaterialCreationAttributes>>(
    'Material',
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
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pdfUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'pdf_url',
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
      tableName: 'materials',
      underscored: true,
      timestamps: true,
    }
  );
}
