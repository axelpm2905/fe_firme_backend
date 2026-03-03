import { Model, DataTypes, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'USER';

export interface UserAttributes {
  id: number;
  email: string;
  passwordHash?: string | null;
  displayName?: string | null;
  googleId?: string | null;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export default function UserModel(sequelize: Sequelize) {
  const User = sequelize.define<Model<UserAttributes, UserCreationAttributes>>(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'email',
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password_hash',
      },
      displayName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'display_name',
      },
      googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'google_id',
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
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
      tableName: 'users',
      underscored: true,
      timestamps: true,
      hooks: {
        beforeCreate: async (user: Model<UserAttributes>) => {
          const u = user.get() as UserAttributes;
          if (u.passwordHash) {
            u.passwordHash = await bcrypt.hash(u.passwordHash, 12);
          }
        },
      },
    }
  );

  (User as any).prototype.comparePassword = async function (plain: string): Promise<boolean> {
    const u = this.get() as UserAttributes;
    if (!u.passwordHash) return false;
    return bcrypt.compare(plain, u.passwordHash);
  };

  return User;
}
