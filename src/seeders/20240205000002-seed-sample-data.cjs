'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'fefirmeadmin@oasis.com' LIMIT 1`
    );
    const adminId = (rows[0] && rows[0].id) || 1;

    await queryInterface.bulkInsert('blogs', [
      {
        title: '¿Qué es la Apologética Cristiana?',
        slug: 'que-es-la-apologetica-cristiana',
        content: '<h2>Introducción</h2><p>La apologética cristiana es la disciplina que se encarga de defender la fe cristiana mediante argumentos racionales y evidencia.</p>',
        featured_image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
        category: 'Apologética',
        author_id: adminId,
        comments_enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Evidencias Históricas de la Resurrección',
        slug: 'evidencias-historicas-resurreccion',
        content: '<h2>Evidencias Arqueológicas</h2><p>La resurrección de Jesucristo es el evento central del cristianismo.</p>',
        featured_image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
        category: 'Doctrina',
        author_id: adminId,
        comments_enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('materials', [
      {
        title: 'Guía de Apologética para Principiantes',
        description: 'Una guía completa para comenzar en el estudio de la apologética cristiana.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        pdf_url: '#',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('events', [
      {
        title: 'Conferencia de Apologética 2024',
        date: '2024-02-15',
        time: '18:00',
        location: 'Iglesia Oasis de Amor, Managua',
        description: 'Una conferencia completa sobre apologética cristiana.',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('youtube_contents', [
      {
        title: 'Introducción a la Apologética',
        description: 'Video introductorio sobre la importancia de la apologética cristiana.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('youtube_contents', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('materials', null, {});
    await queryInterface.bulkDelete('blogs', null, {});
  },
};
