'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('F3F!irme@', 12);
    await queryInterface.bulkInsert('users', [
      {
        email: 'fefirmeadmin@oasis.com',
        password_hash: hash,
        display_name: 'Administrador',
        google_id: null,
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'fefirmeadmin@oasis.com' });
  },
};
